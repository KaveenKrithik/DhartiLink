export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="relative glass holo-border scanlines rounded-xl px-8 py-10">
        <div className="absolute -inset-1 -z-10 rounded-xl blur-lg" aria-hidden="true" />
        <div className="mx-auto flex flex-col items-center gap-4">
          <div className="holo-spinner" aria-hidden="true" />
          <div className="text-center">
            <div className="text-xs tracking-[0.35em] text-accent-foreground/80">LOADING</div>
            <h1 className="holo-glow mt-1 text-3xl font-semibold md:text-4xl">DhartiLink</h1>
            <p className="mt-1 text-xs text-muted-foreground">Preparing the hologram interface…</p>
          </div>
        </div>
      </div>
    </div>
  )
}
