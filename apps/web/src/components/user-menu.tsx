import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Settings, LogOut, LayoutDashboard, HelpCircle } from "lucide-react";

export function UserProfileDropdown() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-9 w-9 rounded-full" />;
	}

	if (!session) {
		return null; // Don't render anything if not logged in (parent handles login buttons)
	}

	const { user } = session;
	const initials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-9 w-9 rounded-full">
					<Avatar className="h-9 w-9 border border-border">
						<AvatarImage src={user.image || ""} alt={user.name} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/dashboard" className="cursor-pointer">
							<LayoutDashboard className="mr-2 h-4 w-4" />
							Dashboard
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/dashboard/profile" className="cursor-pointer">
							<User className="mr-2 h-4 w-4" />
							Profile
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/dashboard/settings" className="cursor-pointer">
							<Settings className="mr-2 h-4 w-4" />
							Settings
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href={"/dashboard/help" as any} className="cursor-pointer">
							<HelpCircle className="mr-2 h-4 w-4" />
							Help
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-red-600 focus:text-red-600 focus:bg-red-100/50 dark:focus:bg-red-900/10 cursor-pointer"
					onClick={async () => {
						await authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									router.push("/"); // Redirect to home or login
									router.refresh();
								},
							},
						});
					}}
				>
					<LogOut className="mr-2 h-4 w-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

