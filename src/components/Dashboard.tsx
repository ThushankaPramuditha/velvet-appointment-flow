import { useState } from "react";
import {
  useAppointments,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Play,
  Check,
  X,
  UserX,
  Calendar,
  RefreshCw,
  Search,
} from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "in-queue": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "in-progress": "bg-primary/20 text-primary border-primary/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  "no-show": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { data: appointments = [], isLoading, refetch } = useAppointments(selectedDate);
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const filteredAppointments = appointments.filter(
    (a) =>
      a.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customer_phone.includes(searchQuery)
  );

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAppointment.mutateAsync({ id, updates: { status } });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this appointment?")) return;
    try {
      await deleteAppointment.mutateAsync(id);
      toast.success("Appointment removed");
    } catch (error) {
      toast.error("Failed to remove appointment");
    }
  };

  const handleAddToQueue = async (id: string) => {
    try {
      const maxPosition = Math.max(
        0,
        ...appointments
          .filter((a) => a.queue_position)
          .map((a) => a.queue_position!)
      );
      await updateAppointment.mutateAsync({
        id,
        updates: { status: "in-queue", queue_position: maxPosition + 1 },
      });
      toast.success("Added to queue");
    } catch (error) {
      toast.error("Failed to add to queue");
    }
  };

  const handleStartService = async (id: string) => {
    try {
      // First, complete any current in-progress appointment
      const currentInProgress = appointments.find(
        (a) => a.status === "in-progress"
      );
      if (currentInProgress) {
        await updateAppointment.mutateAsync({
          id: currentInProgress.id,
          updates: { status: "completed" },
        });
      }
      await updateAppointment.mutateAsync({
        id,
        updates: { status: "in-progress" },
      });
      toast.success("Service started");
    } catch (error) {
      toast.error("Failed to start service");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Barber <span className="gold-gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage appointments and waiting list
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 bg-card"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40 bg-card"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-luxury p-4">
            <p className="text-muted-foreground text-sm">Total Today</p>
            <p className="text-3xl font-bold text-primary">{appointments.length}</p>
          </div>
          <div className="card-luxury p-4">
            <p className="text-muted-foreground text-sm">In Queue</p>
            <p className="text-3xl font-bold text-purple-400">
              {appointments.filter((a) => a.status === "in-queue").length}
            </p>
          </div>
          <div className="card-luxury p-4">
            <p className="text-muted-foreground text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-400">
              {appointments.filter((a) => a.status === "completed").length}
            </p>
          </div>
          <div className="card-luxury p-4">
            <p className="text-muted-foreground text-sm">No-Shows</p>
            <p className="text-3xl font-bold text-gray-400">
              {appointments.filter((a) => a.status === "no-show").length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="card-luxury overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Service</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No appointments found for this date
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    className="border-border/30 hover:bg-card/50"
                  >
                    <TableCell className="font-mono text-lg">
                      {appointment.appointment_time.slice(0, 5)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{appointment.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.customer_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColors[appointment.status]} border`}
                      >
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {appointment.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToQueue(appointment.id)}
                            title="Add to queue"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {(appointment.status === "in-queue" ||
                          appointment.status === "confirmed") && (
                          <Button
                            size="sm"
                            variant="gold"
                            onClick={() => handleStartService(appointment.id)}
                            title="Start service"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {appointment.status === "in-progress" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleStatusChange(appointment.id, "completed")
                            }
                            title="Complete"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Done
                          </Button>
                        )}
                        {!["completed", "cancelled", "no-show"].includes(
                          appointment.status
                        ) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-400 border-orange-400/30 hover:bg-orange-400/10"
                              onClick={() =>
                                handleStatusChange(appointment.id, "no-show")
                              }
                              title="Mark as no-show"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => handleDelete(appointment.id)}
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
