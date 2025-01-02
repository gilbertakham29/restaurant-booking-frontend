"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

import {
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  Typography,
  Box,
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
interface BookingFormProps {}

interface BookingData {
  date: Date;
  time: string;
  guests: number;
  name: string;
  contact: string;
}
const BookingForm: React.FC<BookingFormProps> = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>("");
  const [guests, setGuests] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [errMsg, setErrorMsg] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (isMounted) {
      const fetchAvailability = async () => {
        try {
          const response = await axios.get<string[]>(
            `https://restaurant-bookings-api.onrender.com/api/availability`
          );
          setAvailableSlots(response.data);
        } catch (error) {
          console.error("Error fetching availability", error);
          setAvailableSlots([]);
        }
      };

      fetchAvailability();
    }
  }, [isMounted]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!date || !time || !name || !contact) {
      setMessage("Please fill out all required fields!");
      return;
    }
    const bookingData: BookingData = { date, time, guests, name, contact };
    try {
      const resposne = await axios.post(
        "https://restaurant-bookings-api.onrender.com/api/bookings",
        bookingData
      );
      setMessage(
        "Booking successful! Your details: " + JSON.stringify(resposne.data)
      );
      setDialogOpen(true);

      setTimeout(() => {
        setDialogOpen(false);
        setName("");
        setGuests(0);
        setContact("");
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setErrorMsg("Booking time slot already booked.");
      } else {
        setErrorMsg("");
      }
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          flexDirection: "column",
          padding: 2,
          width: "100%",
        }}
      >
        <Box
          sx={{
            maxWidth: "600px",
            width: "100%",
            boxShadow: 3,
            borderRadius: 2,
            padding: 3,
          }}
        >
          <Typography
            variant="h4"
            fontFamily="sans-serif"
            gutterBottom
            align="center"
          >
            Restaurant Table Bookings
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <DatePicker
                label="Select Date"
                value={date}
                sx={{ width: "100%" }}
                onChange={(newDate) => setDate(newDate)}
                slots={{
                  textField: (params: any) => <TextField {...params} />,
                }}
              />
            </Box>

            <FormControl fullWidth>
              <Select
                labelId="time-select-label"
                value={time || ""}
                onChange={(e) => setTime(e.target.value)}
                displayEmpty
                sx={{ width: "100%", marginTop: "10px" }}
              >
                <MenuItem disabled>Select a time slot</MenuItem>
                {availableSlots.map((slot, index) => (
                  <MenuItem key={index} value={slot}>
                    {slot}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Number of Guests"
              type="number"
              value={guests}
              sx={{ width: "100%", marginTop: "10px" }}
              onChange={(e) => setGuests(Number(e.target.value))}
            />

            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ width: "100%", marginTop: "10px" }}
            />

            <TextField
              label="Contact Details"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              sx={{ width: "100%", marginTop: "10px" }}
            />

            <Button
              variant="contained"
              type="submit"
              color="primary"
              sx={{ width: "100%", marginTop: "10px" }}
            >
              Book Now
            </Button>
          </form>

          {errMsg && (
            <Typography variant="body1" color="error" align="center">
              {errMsg}
            </Typography>
          )}
        </Box>
        {message && (
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            sx={{ width: "100%" }}
          >
            <DialogTitle style={{ color: "green" }}>
              {" "}
              Booked Successfull!
            </DialogTitle>
            <DialogContent>
              <Typography style={{ fontSize: 20 }} gutterBottom>
                Booking Details
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong>
                {name}
              </Typography>
              <Typography variant="body1">
                <strong>Guests:</strong>
                {guests}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong>
                {contact}
              </Typography>
              <Typography variant="body1">
                <strong>Time Slot:</strong>
                {time}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </LocalizationProvider>
  );
};
export default BookingForm;
