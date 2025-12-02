import { bookingService } from "../services/booking.service.js";

export const getAllBooking = async (req, res, next)=>{
    try{
        const {propertyId} = req.params;
        const bookings = await bookingService.getAllBookingsByProperty(propertyId);
        return res.status(200).json({
            success: true,
            data: bookings,
        });
    }catch(err){
        next(err);
    }
}