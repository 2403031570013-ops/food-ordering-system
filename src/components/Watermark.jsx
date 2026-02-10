export default function Watermark() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex flex-wrap content-center items-center justify-center select-none" style={{ opacity: 0.04 }}>
            <div className="w-[150%] h-[150%] flex flex-wrap content-center items-center justify-center -rotate-12 transform -translate-x-20 -translate-y-20">
                {Array.from({ length: 120 }).map((_, i) => (
                    <div
                        key={i}
                        className="text-6xl md:text-8xl font-black text-slate-800 m-8 md:m-16 tracking-tighter"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        FoodHub Now
                    </div>
                ))}
            </div>
        </div>
    );
}
