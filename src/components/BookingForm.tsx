import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSalonConfig } from "@/hooks/useSalonConfig";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useBookedSlots, isSlotBooked } from "@/hooks/useBookedSlots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { CalendarIcon, Clock, User, Phone, Mail, CheckCircle, Ban } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: config } = useSalonConfig();
  const createAppointment = useCreateAppointment();
  const { data: bookedSlots = [] } = useBookedSlots();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    service: searchParams.get("service") || "",
    appointment_date: undefined as Date | undefined,
    appointment_time: "",
  });

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const services = config?.services || [];

  // Get today and tomorrow only
  const today = new Date();
  const tomorrow = addDays(today, 1);

  // Check if a time slot is in the past (for today only)
  const isTimeSlotPast = (time: string, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !isSameDay(selectedDate, today)) {
      return false;
    }
    
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hours, minutes, 0, 0);
    
    return slotTime <= now;
  };

  // Check if slot is booked
  const isBooked = (time: string): boolean => {
    if (!formData.appointment_date) return false;
    const dateStr = format(formData.appointment_date, "yyyy-MM-dd");
    return isSlotBooked(bookedSlots, dateStr, time);
  };

  // Get available time slots
  const getAvailableSlots = () => {
    return timeSlots.map((time) => ({
      time,
      isPast: isTimeSlotPast(time, formData.appointment_date),
      isBooked: isBooked(time),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.appointment_date || !formData.appointment_time) {
      toast.error("Please select a date and time");
      return;
    }

    // Final validation: check if slot is still available
    const dateStr = format(formData.appointment_date, "yyyy-MM-dd");
    if (isSlotBooked(bookedSlots, dateStr, formData.appointment_time)) {
      toast.error("This time slot was just booked. Please select another time.");
      setStep(2);
      return;
    }

    // Check if time is in the past
    if (isTimeSlotPast(formData.appointment_time, formData.appointment_date)) {
      toast.error("Cannot book a past time slot. Please select a future time.");
      setStep(2);
      return;
    }

    try {
      await createAppointment.mutateAsync({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || undefined,
        service: formData.service,
        appointment_date: dateStr,
        appointment_time: formData.appointment_time,
      });

      setIsSuccess(true);
      toast.success("Appointment booked successfully!");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="card-luxury p-12 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">
            Your appointment has been scheduled. We'll see you soon!
          </p>
          <div className="bg-background/50 rounded-lg p-4 mb-6">
            <p className="font-semibold">{formData.service}</p>
            <p className="text-primary">
              {formData.appointment_date && format(formData.appointment_date, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-muted-foreground">{formData.appointment_time}</p>
          </div>
          <Button variant="gold" onClick={() => navigate("/")} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Book Your <span className="gold-gradient-text">Appointment</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Book for today or tomorrow. Select your preferred service, date, and time.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 rounded transition-all ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-luxury p-8 animate-fade-in-up">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-display text-2xl font-semibold mb-6">
                  Select Your Service
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, service: service.name });
                        setStep(2);
                      }}
                      className={`p-6 rounded-xl border text-left transition-all hover:border-primary ${
                        formData.service === service.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-card"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg">{service.name}</h4>
                        <span className="text-primary font-bold">${service.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{service.duration} min</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-2xl font-semibold">
                    Pick Date & Time
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <Label className="mb-3 block">Select Date (Today or Tomorrow)</Label>
                    <Calendar
                      mode="single"
                      selected={formData.appointment_date}
                      onSelect={(date) =>
                        setFormData({ ...formData, appointment_date: date, appointment_time: "" })
                      }
                      disabled={(date) => {
                        const dateToCheck = new Date(date);
                        dateToCheck.setHours(0, 0, 0, 0);
                        
                        const todayStart = new Date(today);
                        todayStart.setHours(0, 0, 0, 0);
                        
                        const tomorrowStart = new Date(tomorrow);
                        tomorrowStart.setHours(0, 0, 0, 0);
                        
                        // Only allow today and tomorrow, exclude Sunday
                        const isToday = dateToCheck.getTime() === todayStart.getTime();
                        const isTomorrow = dateToCheck.getTime() === tomorrowStart.getTime();
                        const isSunday = date.getDay() === 0;
                        
                        return !isToday && !isTomorrow || isSunday;
                      }}
                      className="rounded-xl border border-border bg-card p-3"
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block">Select Time</Label>
                    {!formData.appointment_date ? (
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        Please select a date first
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-2">
                        {getAvailableSlots().map(({ time, isPast, isBooked }) => {
                          const isDisabled = isPast || isBooked;
                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                if (!isDisabled) {
                                  setFormData({ ...formData, appointment_time: time });
                                  setStep(3);
                                }
                              }}
                              className={`p-3 rounded-lg border text-center transition-all ${
                                isDisabled
                                  ? "border-border bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                                  : formData.appointment_time === time
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary hover:bg-card"
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {isBooked && <Ban className="h-3 w-3" />}
                                <span>{time}</span>
                              </div>
                              {isBooked && (
                                <span className="text-xs block">Booked</span>
                              )}
                              {isPast && !isBooked && (
                                <span className="text-xs block">Past</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-2xl font-semibold">
                    Your Details
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                </div>

                {/* Summary */}
                <div className="bg-background/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{formData.service}</p>
                      <p className="text-primary">
                        {formData.appointment_date &&
                          format(formData.appointment_date, "EEEE, MMMM d")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formData.appointment_time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_phone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email (optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="bg-background"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="xl"
                  className="w-full mt-8"
                  disabled={createAppointment.isPending}
                >
                  {createAppointment.isPending ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
