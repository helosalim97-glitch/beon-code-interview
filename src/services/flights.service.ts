
import {
  Database,
  Flight,
  FlightPassenger
} from '../databases/database_abstract';

import { DatabaseInstanceStrategy } from '../database';

export class FlightsService {
  private readonly _db: Database;

  constructor() {
    this._db = DatabaseInstanceStrategy.getInstance();
  }

  public async getFlights(): Promise<Flight[]> {
    return this._db.getFlights();
  }

  public async updateFlightStatus(code: string): Promise<unknown> {
    return this._db.updateFlightStatus(code);
  }

  public async addFlight(flight: Flight): Promise<unknown> {
    return this._db.addFlight(flight);
  }

  public async assignPassenger(
    flightCode: string,
    passengerId: number
  ): Promise<FlightPassenger> {
    return this._db.assignPassenger(flightCode, passengerId);
  }
}
