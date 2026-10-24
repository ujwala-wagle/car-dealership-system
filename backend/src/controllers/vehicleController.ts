import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { VehicleService } from '../services/vehicleService';

export class VehicleController {
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const vehicle = await VehicleService.createVehicle(req.body);
      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        vehicle
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to create vehicle'
      });
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const vehicles = await VehicleService.getAllVehicles();
      res.status(200).json({
        success: true,
        count: vehicles.length,
        vehicles
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve vehicles'
      });
    }
  }

  static async search(req: AuthenticatedRequest, res: Response) {
    try {
      const { make, model, category, minPrice, maxPrice } = req.query;
      const vehicles = await VehicleService.searchVehicles({
        make: make ? String(make) : undefined,
        model: model ? String(model) : undefined,
        category: category ? String(category) : undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined
      });

      res.status(200).json({
        success: true,
        count: vehicles.length,
        vehicles
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Search failed'
      });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
        return;
      }

      const vehicle = await VehicleService.updateVehicle(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
        vehicle
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to update vehicle'
      });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
        return;
      }

      await VehicleService.deleteVehicle(id);
      res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to delete vehicle'
      });
    }
  }

  static async purchase(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
        return;
      }

      const vehicle = await VehicleService.purchaseVehicle(id);
      res.status(200).json({
        success: true,
        message: 'Vehicle purchased successfully',
        vehicle
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to purchase vehicle'
      });
    }
  }

  static async restock(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
        return;
      }

      const { quantity } = req.body;
      const vehicle = await VehicleService.restockVehicle(id, Number(quantity));
      res.status(200).json({
        success: true,
        message: 'Vehicle restocked successfully',
        vehicle
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to restock vehicle'
      });
    }
  }
}
