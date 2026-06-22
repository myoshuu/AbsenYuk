import Skeleton from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <Card key={i}><CardContent className="p-5"><Skeleton className="h-10 w-20 mb-2" /><Skeleton className="h-4 w-32" /></CardContent></Card>)}
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  );
}
