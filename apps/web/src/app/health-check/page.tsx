"use client";

import { api } from "@/trpc/react";

export default function HealthCheckButton() {
    const { data, isLoading, error } = api.healthCheck.useQuery();

    return (
        <div>
            <button
                onClick={() => {
                    console.log(data);
                }}
            >
                Check Health
            </button>

            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && <p>Server says: {data}</p>}
        </div>
    );
}
