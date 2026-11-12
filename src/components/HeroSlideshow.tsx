export function HeroSlideshow() {
  return (
    <div className="hero-slideshow relative">
      <div
        role="img"
        aria-label="Ledige muligheter: et restaurantbord for to og en mekaniker klar til å ta imot en bil."
        className="hero-slideshow-images relative aspect-[1672/941] mix-blend-multiply"
      >
        <img
          src="./img/restaurant.png"
          alt=""
          width={1672}
          height={941}
          fetchPriority="high"
          className="hero-slide hero-slide-restaurant absolute inset-0 h-full w-full object-contain"
        />
        <img
          src="./img/Mechanic.png"
          alt=""
          className="hero-slide hero-slide-mechanic absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  )
}
