import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PageOptionsDto } from '../common/dto/pagination.dto';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.create(userId, dto);
    return {
      success: true,
      message: 'Ulasan berhasil dikirim',
      data: review,
    };
  }

  @Get('property/:propertyId')
  async findByProperty(
    @Param('propertyId', new ParseUUIDPipe({ version: '4' })) propertyId: string,
    @Query() pageOptions: PageOptionsDto,
  ) {
    const data = await this.reviewsService.findByProperty(propertyId, pageOptions);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const review = await this.reviewsService.update(id, userId, role, dto);
    return {
      success: true,
      message: 'Ulasan berhasil diperbarui',
      data: review,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.reviewsService.remove(id, userId, role);
  }
}
