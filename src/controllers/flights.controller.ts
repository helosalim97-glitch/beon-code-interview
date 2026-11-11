
import {
  JsonController,
  Get,
  Param,
  Put,
  Post,
  Body,
  BadRequestError,
  HttpCode
} from 'routing-controllers';

import { FlightsService } from '../services/flights.service';
import { Flight } from '../databases/database_abstract';

@JsonController('/flights', { transformResponse: false })
export default class FlightsController {
  private _flightsService: FlightsService;

  constructor() {
    this._flightsService = new FlightsService();
  }

  @Get('')
  async getAll() {
    return {
      status: 200,
      data: await this._flightsService.getFlights()
    };
  }

  @Put('/:code')
  async updateFlightStatus(@Param('code') code: string) {
    return {
      status: 200,
      data: await this._flightsService.updateFlightStatus(code)
    };
  }

  @Post('')
  async addFlight(@Body() flight: Flight) {
    return {
      status: 200,
      data: await this._flightsService.addFlight(flight)
    };
  }

  @Post('/:code/passengers/:passengerId')
  @HttpCode(201)
  async assignPassenger(
    @Param('code') code: string,
    @Param('passengerId') passengerId: string
  ) {
    if (!/^[1-9]\d*$/.test(passengerId)) {
      throw new BadRequestError('Invalid passenger ID');
    }

    const id = Number(passengerId);

    if (!Number.isSafeInteger(id)) {
      throw new BadRequestError('Invalid passenger ID');
    }

    return {
      status: 201,
      data: await this._flightsService.assignPassenger(code, id)
    };
  }
}
