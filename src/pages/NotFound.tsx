import React from 'react';
import NotFoundIcon from '../assets/not-found-assets/notfoundicon.svg';
import {PrimaryButton} from "../components/buttons/primary-button/primary-button";
import {SecondaryButton} from "../components/buttons/secondary-button/secondary-button";

export interface NotFoundProps {

}

export const NotFound : React.FC<NotFoundProps> = ({}) => {
  return <section className="w-screen h-screen bg-background flex flex-col gap-2 justify-center items-center">
    <div className="relative">
      <img className="absolute -top-[50%] -translate-x-[50px] w-[300px] max-w-max z-0" src={NotFoundIcon} alt={"404 not found..."} />
      <h1 className="relative text-title text-white z-10">404 Whoops! </h1>
    </div>

    <p className="text-white">Are you lost?</p>
    <div className="flex gap-5">
      <PrimaryButton onClick={() => {window.location.href = "/"}} className={""} text={"Go Home"} icon={""}/>
      <SecondaryButton onClick={() => {window.location.href = "TODO"}} className={""} text={"Contact Support"} icon={""} />

    </div>

  </section>
}