export function AnimatedGradientBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/10 to-background" />
      
      {/* Animated gradient orbs */}
      <div 
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-30 animate-gradient-shift"
        style={{
          background: 'radial-gradient(circle, hsl(var(--cyber-blue)) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-20 animate-gradient-shift-reverse"
        style={{
          background: 'radial-gradient(circle, hsl(var(--electric-purple)) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute top-1/4 right-1/4 w-1/2 h-1/2 rounded-full opacity-15 animate-gradient-pulse"
        style={{
          background: 'radial-gradient(circle, hsl(var(--neon-pink)) 0%, transparent 60%)',
        }}
      />
      
      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
    </div>
  )
}
