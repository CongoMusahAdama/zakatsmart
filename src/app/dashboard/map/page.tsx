import GivingMap from "@/components/dashboard/GivingMap";

export default function MapPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-heading font-black text-foreground uppercase tracking-tight text-center md:text-left">Local Giving Map</h1>
                <p className="text-slate-text font-medium text-center md:text-left text-sm md:text-base">Find verified mosques and charity centers near you to fulfill your Zakat.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <GivingMap />
            </div>
        </div>
    );
}
