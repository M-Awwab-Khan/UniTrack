---
trigger: always_on
---

- For this project we are using 
  - Next js
  - Postgres
  - TRPC
  - Drizzle ORM
  - Better Auth

When using trpc on client components, use it the following way, this is just an example from one of correctly implemented module. you have to follow this practice

import { useTRPC } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


const trpc = useTRPC();
const queryClient = useQueryClient();

const { data: codes, isLoading } = useQuery(trpc.admin.enrollmentCodes.list.queryOptions({ courseId: selectedCourseId }));
const { data: courses } = useQuery(trpc.admin.getCourses.queryOptions());

const createMutation = useMutation(trpc.admin.enrollmentCodes.generate.mutationOptions({
        onSuccess: () => {
            const key = trpc.admin.enrollmentCodes.list.queryKey({ courseId: selectedCourseId });
            queryClient.invalidateQueries({ queryKey: key });
            setIsCreateOpen(false);
            toast.success("Enrollment code created successfully");
            setSelectedCourseId("");
            setMaxUses("");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    }));

    const revokeMutation = useMutation(trpc.admin.enrollmentCodes.revoke.mutationOptions({
        onSuccess: () => {
            const key = trpc.admin.enrollmentCodes.list.queryKey({ courseId: selectedCourseId });
            queryClient.invalidateQueries({ queryKey: key });
            toast.success("Code revoked");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    }));


 const handleCreate = () => {
        if (!selectedCourseId) return;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

        createMutation.mutate({
            courseId: selectedCourseId,
            expiresAt: parseInt(expiryDays) > 0 ? expiresAt : undefined, // Assuming logic handles date
            maxUses: maxUses ? parseInt(maxUses) : undefined
        });
    };

To check loading use .isPending of the mutation not .isLoading

