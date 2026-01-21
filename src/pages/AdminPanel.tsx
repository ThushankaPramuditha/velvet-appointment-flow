import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers, useAddUserRole, useRemoveUserRole } from "@/hooks/useAdminUsers";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, UserPlus, Shield, Scissors, X, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isStaff, isLoading: authLoading, user } = useAuth();
  const { data: users, isLoading: usersLoading, error } = useAdminUsers();
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();

  // Check if current user is admin
  const isAdmin = users?.find((u) => u.id === user?.id)?.roles.includes("admin");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/auth");
      } else if (!isStaff) {
        navigate("/");
      }
    }
  }, [authLoading, isAuthenticated, isStaff, navigate]);

  const handleAddRole = async (userId: string, role: "admin" | "barber") => {
    try {
      await addRole.mutateAsync({ userId, role });
      toast.success(`Added ${role} role successfully`);
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to add role");
      }
    }
  };

  const handleRemoveRole = async (userId: string, role: "admin" | "barber" | "user") => {
    try {
      await removeRole.mutateAsync({ userId, role });
      toast.success(`Removed ${role} role successfully`);
    } catch (error) {
      toast.error("Failed to remove role");
    }
  };

  if (authLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isStaff) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="card-luxury p-8 text-center">
            <p className="text-destructive">Failed to load users. You may not have admin access.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions. Promote users to staff or admin.
          </p>
        </div>

        <div className="card-luxury overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name || "No name"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.length === 0 ? (
                        <Badge variant="secondary">Customer</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={role === "admin" ? "default" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            {role === "admin" ? (
                              <Shield className="h-3 w-3" />
                            ) : (
                              <Scissors className="h-3 w-3" />
                            )}
                            {role}
                            {isAdmin && (role === "admin" || role === "barber") && (
                              <button
                                onClick={() => handleRemoveRole(user.id, role as "admin" | "barber" | "user")}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at
                      ? format(new Date(user.last_sign_in_at), "MMM d, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!user.roles.includes("barber") && (
                            <DropdownMenuItem
                              onClick={() => handleAddRole(user.id, "barber")}
                            >
                              <Scissors className="h-4 w-4 mr-2" />
                              Make Staff (Barber)
                            </DropdownMenuItem>
                          )}
                          {!user.roles.includes("admin") && (
                            <DropdownMenuItem
                              onClick={() => handleAddRole(user.id, "admin")}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!isAdmin && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Only admins can modify user roles. Contact an admin to get promoted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
