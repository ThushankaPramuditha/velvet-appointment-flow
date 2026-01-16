import { useState } from "react";
import { useSalonConfig, SalonService } from "@/hooks/useSalonConfig";
import { useUpdateServices } from "@/hooks/useUpdateServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";

const ServiceManager = () => {
  const { data: config, isLoading } = useSalonConfig();
  const updateServices = useUpdateServices();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingService, setEditingService] = useState<SalonService | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [newService, setNewService] = useState({
    name: "",
    duration: 30,
    price: 25,
  });

  const services = config?.services || [];

  const handleAddService = async () => {
    if (!newService.name.trim()) {
      toast.error("Please enter a service name");
      return;
    }

    const updatedServices = [...services, newService];
    
    try {
      await updateServices.mutateAsync(updatedServices);
      toast.success("Service added successfully");
      setNewService({ name: "", duration: 30, price: 25 });
      setIsAddOpen(false);
    } catch (error) {
      toast.error("Failed to add service");
    }
  };

  const handleEditService = async () => {
    if (!editingService) return;
    
    const updatedServices = services.map((s) =>
      s.name === editingService.name ? editingService : s
    );
    
    try {
      await updateServices.mutateAsync(updatedServices);
      toast.success("Service updated successfully");
      setEditingService(null);
      setIsEditOpen(false);
    } catch (error) {
      toast.error("Failed to update service");
    }
  };

  const handleDeleteService = async (serviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"?`)) return;
    
    const updatedServices = services.filter((s) => s.name !== serviceName);
    
    try {
      await updateServices.mutateAsync(updatedServices);
      toast.success("Service deleted successfully");
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const openEditDialog = (service: SalonService) => {
    setEditingService({ ...service });
    setIsEditOpen(true);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading services...</div>;
  }

  return (
    <div className="card-luxury p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Manage Services</h2>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Service Name</Label>
                <Input
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  placeholder="e.g., Beard Trim"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    min={5}
                    step={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={5}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                variant="gold"
                className="w-full"
                onClick={handleAddService}
                disabled={updateServices.isPending}
              >
                {updateServices.isPending ? "Adding..." : "Add Service"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground">Service</TableHead>
            <TableHead className="text-muted-foreground">Duration</TableHead>
            <TableHead className="text-muted-foreground">Price</TableHead>
            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No services configured. Add your first service!
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow key={service.name} className="border-border/30">
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.duration} min</TableCell>
                <TableCell className="text-primary font-semibold">
                  ${service.price}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleDeleteService(service.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4 pt-4">
              <div>
                <Label>Service Name</Label>
                <Input
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={editingService.duration}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    min={5}
                    step={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={editingService.price}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={5}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                variant="gold"
                className="w-full"
                onClick={handleEditService}
                disabled={updateServices.isPending}
              >
                {updateServices.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManager;
