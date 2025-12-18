
"use client";

import { useState } from "react";
import { TAInvitesTable } from "@/components/admin/ta-invites/ta-invites-table";
import { CreateInviteModal } from "@/components/admin/ta-invites/create-invite-modal";
import { MOCK_INVITES } from "@/components/admin/ta-invites/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminTAInvitesPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Teaching Assistant Invitations
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Create and manage invite codes for teaching assistants.
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 shadow-sm">
                    <Plus className="w-4 h-4" />
                    Create TA Invite
                </Button>
            </div>

            {/* Metrics (Optional, keeps it looking "admin-y") */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Active Invites</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{MOCK_INVITES.filter(i => i.status === 'Active').length}</div>
                    <p className="text-xs text-muted-foreground">Ready to be used</p>
                </div>
                {/* We could add more metrics here like "Total TAs", "Expiring Soon" etc. */}
            </div>

            {/* Main Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <TAInvitesTable invites={MOCK_INVITES} />
            </motion.div>

            {/* Modal */}
            <CreateInviteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
