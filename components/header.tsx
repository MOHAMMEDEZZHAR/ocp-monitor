import { Clock, Users } from "lucide-react"
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isConnected: boolean
  lastUpdate: Date | null
}

export function Header({ isConnected, lastUpdate }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const getConnectionStatus = () => {
    return isConnected ? 'Connected' : 'Disconnected'
  }

  const handleSignOut = () => {
    signOut();
  };

  const handleManageUsers = () => {
    router.push('/admin/users');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">OPC UA Dashboard</h1>
          {session?.user && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Logged in as: <strong>{session.user.name}</strong> ({session.user.role})
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session?.user?.role === 'admin' && (
            <Button
              onClick={handleManageUsers}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          )}
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
          >
            Sign Out
          </Button>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {lastUpdate
                ? new Date(lastUpdate).toLocaleTimeString(
                    "en-US",
                  )
                : "Last Update: not yet"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">{getConnectionStatus()}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
