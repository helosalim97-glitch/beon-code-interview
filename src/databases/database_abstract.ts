
export interface Flight {
  code: string;
  origin: string;
  destination: string;
  status: string;
}

export interface Passenger {
  id: number;
  name: string;
  gender: string;
  email: string;
}

export interface FlightPassenger {
  flightCode: string;
  passengerId: number;
}

export abstract class Database {
  abstract getFlights(): Promise<Flight[]>;

  abstract updateFlightStatus(code: string): Promise<unknown>;

  abstract addFlight(flight: Flight): Promise<unknown>;

  abstract assignPassenger(
    flightCode: string,
    passengerId: number
  ): Promise<FlightPassenger>;
}
