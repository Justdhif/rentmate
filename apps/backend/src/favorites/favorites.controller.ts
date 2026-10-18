import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  async toggle(
    @CurrentUser('id') userId: string,
    @Body() dto: ToggleFavoriteDto,
  ) {
    const result = await this.favoritesService.toggle(userId, dto);
    return {
      success: true,
      ...result,
    };
  }

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    const data = await this.favoritesService.findAll(userId);
    return {
      success: true,
      data,
    };
  }

  @Get('ids')
  async getUserFavoriteIds(@CurrentUser('id') userId: string) {
    const data = await this.favoritesService.getUserFavoriteIds(userId);
    return {
      success: true,
      data,
    };
  }
}
