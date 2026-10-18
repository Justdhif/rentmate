import 'reflect-metadata';
import { PageOptionsDto, PageMetaDto, PaginatedResponseDto } from './pagination.dto';

describe('Pagination DTOs', () => {
  describe('PageOptionsDto', () => {
    it('should calculate skip correctly for first page', () => {
      const pageOptions = new PageOptionsDto();
      expect(pageOptions.skip).toBe(0);
    });

    it('should calculate skip correctly for page 3 with limit 15', () => {
      const pageOptions = Object.assign(new PageOptionsDto(), {
        page: 3,
        limit: 15,
      });
      expect(pageOptions.skip).toBe(30);
    });
  });

  describe('PageMetaDto', () => {
    it('should construct pagination metadata accurately', () => {
      const pageOptions = Object.assign(new PageOptionsDto(), {
        page: 2,
        limit: 10,
      });
      const meta = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount: 45 });

      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(10);
      expect(meta.itemCount).toBe(45);
      expect(meta.pageCount).toBe(5);
      expect(meta.hasPreviousPage).toBe(true);
      expect(meta.hasNextPage).toBe(true);
    });

    it('should indicate no previous page on page 1 and no next page on last page', () => {
      const pageOptionsFirst = Object.assign(new PageOptionsDto(), {
        page: 1,
        limit: 10,
      });
      const metaFirst = new PageMetaDto({
        pageOptionsDto: pageOptionsFirst,
        itemCount: 10,
      });
      expect(metaFirst.hasPreviousPage).toBe(false);
      expect(metaFirst.hasNextPage).toBe(false);
    });
  });

  describe('PaginatedResponseDto', () => {
    it('should wrap data and metadata with success=true', () => {
      const pageOptions = new PageOptionsDto();
      const meta = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount: 1 });
      const response = new PaginatedResponseDto(['item1'], meta);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(['item1']);
      expect(response.meta).toBe(meta);
    });
  });
});
