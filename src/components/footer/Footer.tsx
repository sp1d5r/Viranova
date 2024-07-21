import React from 'react';
import { Logo } from '../logo/logo';

export interface FooterProps {

}

export const Footer: React.FC<FooterProps> = () => {
  return <footer className="rounded-lg shadow bg-emerald-950/30 m-4 z-50 text-white my-16 w-[95%]">
    <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <a href="https://flowbite.com/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
          <Logo />
        </a>
        <ul className="flex flex-wrap items-center mb-6 text-sm font-medium sm:mb-0 text-gray-400">
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">About</a>
          </li>
          <li>
            <a href="/privacy-policy" className="hover:underline me-4 md:me-6">Privacy Policy</a>
          </li>
          <li>
            <a href="/terms-of-service" className="hover:underline me-4 md:me-6">Terms of Service</a>
          </li>
          <li>
            <a href="#" className="hover:underline">Contact</a>
          </li>
        </ul>
      </div>
      <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
      <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="https://master.d2gor5eji1mb54.amplifyapp.com" className="hover:underline">ViraNova™</a>. All Rights Reserved.</span>
    </div>
  </footer>
}