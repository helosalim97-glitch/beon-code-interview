
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  Database,
  Flight,
  FlightPassenger
} from '../database_abstract';

import { FlightsModel } from './models/flights.model';

export class MongoStrategy extends Database {
  private readonly ready: Promise<void>;

  constructor() {
    super();
    this.ready = this.initialize();
  }

  private async initialize(): Promise<void> {
    const mongo = await MongoMemoryServer.create();

    await mongoose.connect(mongo.getUri());

    await FlightsModel.create([
      {
        code: 'ABC-123',
        origin: 'EZE',
        destination: 'LDN',
        status: 'ACTIVE'
      },
      {
        code: 'XYZ-678',
        origin: 'CRC',
        destination: 'MIA',
        status: 'ACTIVE'
      }
    ]);
  }

  public async getFlights(): Promise<Flight[]> {
    await this.ready;

    const flights = await FlightsModel.find({}).lean();

    return flights.map((flight: Flight) => ({
      code: flight.code,
      origin: flight.origin,
      destination: flight.destination,
      status: flight.status
    }));
  }

  public async addFlight(flight: Flight): Promise<unknown> {
    await this.ready;

    return FlightsModel.create(flight);
  }

  public async updateFlightStatus(code: string): Promise<unknown> {
    await this.ready;

    return FlightsModel.findOneAndUpdate(
      { code },
      { status: 'delayed' },
      { new: true }
    );
  }

  public async assignPassenger(
    flightCode: string,
    passengerId: number
  ): Promise<FlightPassenger> {
    throw new Error(
      'Passenger assignment is not implemented for MongoDB'
    );
  }
}
