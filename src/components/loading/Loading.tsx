import React, {useEffect, useRef} from "react";
import LogoIcon from "../../assets/logo/Scissors.svg";
import gsap from "gsap";

export interface LoadingProps{
  className?: string
  id: string
  text?: string
}

export const LoadingIcon: React.FC<LoadingProps> = ({className = "", id, text="Operating ..."}) => {
  const comp = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      let timeline = gsap.timeline({repeat: -1, defaults: {duration: 1}});
      timeline.to([`#loadingLogoIcon${id}`, `#loadingLogoI${id}`, `#loadingLogoR${id}`, `#loadingLogoA${id}`, `#loadingLogoN${id}`, `#loadingLogoO${id}`, `#loadingLogoV${id}`, `#loadingLogoA2${id}`], {
        y: "+=5",
        stagger: 0.2,
      }).to([`#loadingLogoIcon${id}`, `#loadingLogoI${id}`, `#loadingLogoR${id}`, `#loadingLogoA${id}`, `#loadingLogoN${id}`, `#loadingLogoO${id}`, `#loadingLogoV${id}`, `#loadingLogoA2${id}`], {
        y: "0",
        stagger: 0.2,
      })
    }, comp);

    return () => ctx.revert();

  }, []);

  return <div className={`${className} flex justify-center items-center`}>
    <div ref={comp} className="flex flex-col justify-center items-center gap-2">
        <span className='text-2xl text-white font-bold flex items-center justify-center gap-1'>
            <img id={`loadingLogoIcon${id}`} src={LogoIcon} alt="" className={"h-8 w-8"} />
            <span id={`loadingLogoI${id}`}>I</span>
            <span id={`loadingLogoR${id}`}>R</span>
            <span id={`loadingLogoA${id}`}>A</span>
            <span id={`loadingLogoN${id}`} className="text-primary">N</span>
            <span id={`loadingLogoO${id}`} className="text-primary">O</span>
            <span id={`loadingLogoV${id}`} className="text-primary">V</span>
            <span id={`loadingLogoA2${id}`} className="text-primary">A</span>
        </span>
      <span className="text-white flex gap-2">
            <span className="text-primary font-bold">{text}</span>
        </span>
    </div>
  </div>
}