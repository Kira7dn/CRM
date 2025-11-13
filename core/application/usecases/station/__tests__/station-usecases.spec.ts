import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateStationUseCase } from '../create-station';
import { UpdateStationUseCase } from '../update-station';
import { GetStationByIdUseCase } from '../get-station-by-id';
import { GetStationsUseCase } from '../get-stations';
import { DeleteStationUseCase } from '../delete-station';
import type { StationService } from '@/core/application/interfaces/station-service';
import type { Station } from '@/core/domain/station';

describe('Station Use Cases', () => {
  let mockStationService: StationService;

  beforeEach(() => {
    mockStationService = {
      create: vi.fn(),
      update: vi.fn(),
      getById: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe('CreateStationUseCase', () => {
    it('should create a station with all fields', async () => {
      const mockStation: Station = {
        id: 1,
        name: 'Cô Tô Port',
        address: '123 Harbor Road, Cô Tô Island',
        phone: '0123456789',
        image: 'https://example.com/station.jpg',
        latitude: 20.9847,
        longitude: 107.7697,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockStationService.create).mockResolvedValue(mockStation);

      const useCase = new CreateStationUseCase(mockStationService);
      const result = await useCase.execute({
        name: 'Cô Tô Port',
        address: '123 Harbor Road, Cô Tô Island',
        phone: '0123456789',
        image: 'https://example.com/station.jpg',
        latitude: 20.9847,
        longitude: 107.7697,
      });

      expect(mockStationService.create).toHaveBeenCalled();
      expect(result.station).toEqual(mockStation);
      expect(result.station.latitude).toBe(20.9847);
      expect(result.station.longitude).toBe(107.7697);
    });

    it('should create a station without coordinates', async () => {
      const mockStation: Station = {
        id: 2,
        name: 'Distribution Center',
        address: 'Hanoi',
        phone: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockStationService.create).mockResolvedValue(mockStation);

      const useCase = new CreateStationUseCase(mockStationService);
      const result = await useCase.execute({
        name: 'Distribution Center',
        address: 'Hanoi',
        phone: '0987654321',
      });

      expect(result.station.latitude).toBeUndefined();
      expect(result.station.longitude).toBeUndefined();
    });
  });

  describe('UpdateStationUseCase', () => {
    it('should update an existing station', async () => {
      const mockStation: Station = {
        id: 1,
        name: 'Updated Port',
        address: 'New Address',
        phone: '0111222333',
        image: 'https://example.com/updated.jpg',
        latitude: 21.0,
        longitude: 108.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockStationService.update).mockResolvedValue(mockStation);

      const useCase = new UpdateStationUseCase(mockStationService);
      const result = await useCase.execute({
        id: 1,
        name: 'Updated Port',
        address: 'New Address',
        phone: '0111222333',
      });

      expect(mockStationService.update).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result.station).toEqual(mockStation);
    });

    it('should return null when station not found', async () => {
      vi.mocked(mockStationService.update).mockResolvedValue(null);

      const useCase = new UpdateStationUseCase(mockStationService);
      const result = await useCase.execute({
        id: 999,
        name: 'Non-existent',
      });

      expect(result.station).toBeNull();
    });
  });

  describe('GetStationByIdUseCase', () => {
    it('should return a station by id', async () => {
      const mockStation: Station = {
        id: 1,
        name: 'Cô Tô Port',
        address: '123 Harbor Road',
        phone: '0123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockStationService.getById).mockResolvedValue(mockStation);

      const useCase = new GetStationByIdUseCase(mockStationService);
      const result = await useCase.execute({ id: 1 });

      expect(mockStationService.getById).toHaveBeenCalledWith(1);
      expect(result.station).toEqual(mockStation);
    });

    it('should return null when station not found', async () => {
      vi.mocked(mockStationService.getById).mockResolvedValue(null);

      const useCase = new GetStationByIdUseCase(mockStationService);
      const result = await useCase.execute({ id: 999 });

      expect(result.station).toBeNull();
    });
  });

  describe('GetStationsUseCase', () => {
    it('should return all stations', async () => {
      const mockStations: Station[] = [
        {
          id: 1,
          name: 'Cô Tô Port',
          address: '123 Harbor Road',
          phone: '0123456789',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Distribution Center',
          address: 'Hanoi',
          phone: '0987654321',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockStationService.getAll).mockResolvedValue(mockStations);

      const useCase = new GetStationsUseCase(mockStationService);
      const result = await useCase.execute();

      expect(mockStationService.getAll).toHaveBeenCalled();
      expect(result.stations).toEqual(mockStations);
      expect(result.stations).toHaveLength(2);
    });

    it('should return empty array when no stations exist', async () => {
      vi.mocked(mockStationService.getAll).mockResolvedValue([]);

      const useCase = new GetStationsUseCase(mockStationService);
      const result = await useCase.execute();

      expect(result.stations).toEqual([]);
      expect(result.stations).toHaveLength(0);
    });
  });

  describe('DeleteStationUseCase', () => {
    it('should delete a station and return true', async () => {
      vi.mocked(mockStationService.delete).mockResolvedValue(true);

      const useCase = new DeleteStationUseCase(mockStationService);
      const result = await useCase.execute({ id: 1 });

      expect(mockStationService.delete).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
    });

    it('should return false when station not found', async () => {
      vi.mocked(mockStationService.delete).mockResolvedValue(false);

      const useCase = new DeleteStationUseCase(mockStationService);
      const result = await useCase.execute({ id: 999 });

      expect(result.success).toBe(false);
    });
  });
});
