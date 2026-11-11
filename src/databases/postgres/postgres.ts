
import { newDb } from 'pg-mem';
import { HttpError, NotFoundError } from 'routing-controllers';
import {
  Database,
  Flight,
  FlightPassenger
} from '../database_abstract';

export class PostgreStrategy extends Database {
  private readonly db = newDb();
  private readonly ready: Promise<void>;

  constructor() {
    super();
    this.ready = this.initialize();
  }

  private async initialize(): Promise<void> {
    this.db.public.none(`
      CREATE TABLE flights (
        code VARCHAR(5) PRIMARY KEY,
        origin VARCHAR(50),
        destination VARCHAR(50),
        status VARCHAR(50)
      );

      CREATE TABLE passengers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE
      );

      CREATE TABLE flight_passengers (
        flight_code VARCHAR(5) NOT NULL,
        passenger_id INTEGER NOT NULL,
        PRIMARY KEY (flight_code, passenger_id),
        FOREIGN KEY (flight_code) REFERENCES flights(code),
        FOREIGN KEY (passenger_id) REFERENCES passengers(id)
      );
    `);

    this.db.public.none(`
      INSERT INTO flights (code, origin, destination, status)
      VALUES
        ('LH123', 'Frankfurt', 'New York', 'on time'),
        ('LH124', 'Frankfurt', 'New York', 'delayed'),
        ('LH125', 'Frankfurt', 'New York', 'on time');
    `);

    this.db.public.none(`
      INSERT INTO passengers (name, gender, email)
      VALUES
        ('John Smith', 'Male', 'john.smith@email.com'),
        ('Matt Simons', 'Male', 'matt@email.com'),
        ('Ana Roberts', 'Female', 'aroberts@email.com'),
        ('Albert Rodriguez', 'Male', 'aroberts2@email.com');
    `);
  }

  private async query(
    sql: string,
    params: Array<string | number> = []
  ): Promise<any[]> {
    const { Client } = this.db.adapters.createPg();
    const client = new Client();

    await client.connect();

    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      await client.end();
    }
  }

  public async getFlights(): Promise<Flight[]> {
    await this.ready;

    return this.query(
      'SELECT code, origin, destination, status FROM flights'
    ) as Promise<Flight[]>;
  }

  public async updateFlightStatus(code: string): Promise<unknown> {
    await this.ready;

    const flights = await this.query(
      'SELECT code FROM flights WHERE code = $1',
      [code]
    );

    if (flights.length === 0) {
      throw new NotFoundError('Flight not found');
    }

    const updated = await this.query(
      `UPDATE flights
       SET status = $1
       WHERE code = $2
       RETURNING code, origin, destination, status`,
      ['delayed', code]
    );

    return updated[0];
  }

  public async addFlight(flight: Flight): Promise<unknown> {
    await this.ready;

    const existing = await this.query(
      'SELECT code FROM flights WHERE code = $1',
      [flight.code]
    );

    if (existing.length > 0) {
      throw new HttpError(409, 'Flight already exists');
    }

    const created = await this.query(
      `INSERT INTO flights (code, origin, destination, status)
       VALUES ($1, $2, $3, $4)
       RETURNING code, origin, destination, status`,
      [
        flight.code,
        flight.origin,
        flight.destination,
        flight.status
      ]
    );

    return created[0];
  }

  public async assignPassenger(
    flightCode: string,
    passengerId: number
  ): Promise<FlightPassenger> {
    await this.ready;

    const flights = await this.query(
      'SELECT code FROM flights WHERE code = $1',
      [flightCode]
    );

    if (flights.length === 0) {
      throw new NotFoundError('Flight not found');
    }

    const passengers = await this.query(
      'SELECT id FROM passengers WHERE id = $1',
      [passengerId]
    );

    if (passengers.length === 0) {
      throw new NotFoundError('Passenger not found');
    }

    const existing = await this.query(
      `SELECT passenger_id
       FROM flight_passengers
       WHERE flight_code = $1 AND passenger_id = $2`,
      [flightCode, passengerId]
    );

    if (existing.length > 0) {
      throw new HttpError(
        409,
        'Passenger already assigned to this flight'
      );
    }

    await this.query(
      `INSERT INTO flight_passengers (flight_code, passenger_id)
       VALUES ($1, $2)`,
      [flightCode, passengerId]
    );

    return {
      flightCode,
      passengerId
    };
  }
}
