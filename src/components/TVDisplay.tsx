import { useQueueAppointments } from "@/hooks/useAppointments";
import { useSalonConfig } from "@/hooks/useSalonConfig";
import { format } from "date-fns";
import { Scissors, Clock, User } from "lucide-react";

const TVDisplay = () => {
  const { data: appointments = [], isLoading } = useQueueAppointments();
  const { data: config } = useSalonConfig();

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const inProgress = appointments.find((a) => a.status === "in-progress");
  const waiting = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "in-queue"
  );

  return (
    <div className="min-h-screen tv-display p-8 lg:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          {config?.logo_url ? (
            <img
              src={config.logo_url}
              alt={config.name}
              className="h-16 w-16 object-contain"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Scissors className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold gold-gradient-text">
              {config?.name || "Luxury Salon"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {config?.tagline || "Premium Grooming Experience"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-5xl lg:text-6xl font-bold text-primary font-display">
            {currentTime}
          </p>
          <p className="text-muted-foreground text-lg">{currentDate}</p>
        </div>
      </div>

      {/* Current Customer */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-muted-foreground mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          NOW SERVING
        </h2>
        {inProgress ? (
          <div className="queue-item current">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <p className="font-display text-5xl font-bold gold-gradient-text">
                    {inProgress.customer_name}
                  </p>
                  <p className="text-2xl text-muted-foreground mt-2">
                    {inProgress.service}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">
                  {inProgress.appointment_time.slice(0, 5)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="queue-item border-dashed">
            <p className="text-center text-2xl text-muted-foreground py-8">
              Ready for the next customer
            </p>
          </div>
        )}
      </div>

      {/* Waiting List */}
      <div>
        <h2 className="text-2xl font-semibold text-muted-foreground mb-6 flex items-center gap-2">
          <Clock className="h-6 w-6" />
          WAITING LIST ({waiting.length})
        </h2>

        {waiting.length === 0 ? (
          <div className="card-luxury p-12 text-center">
            <p className="text-xl text-muted-foreground">
              No customers waiting. Book your appointment now!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {waiting.slice(0, 6).map((appointment, index) => (
              <div
                key={appointment.id}
                className={`queue-item ${index === 0 ? "next" : ""} animate-slide-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-display text-2xl font-semibold">
                        {appointment.customer_name}
                      </p>
                      <p className="text-muted-foreground">
                        {appointment.service}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-primary">
                      {appointment.appointment_time.slice(0, 5)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {waiting.length > 6 && (
          <p className="text-center text-muted-foreground mt-6 text-lg">
            +{waiting.length - 6} more in queue
          </p>
        )}
      </div>
    </div>
  );
};

export default TVDisplay;
