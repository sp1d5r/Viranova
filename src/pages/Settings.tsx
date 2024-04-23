import React, {useState} from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";

export interface SettingsProps {

}

export const Settings:React.FC<SettingsProps> = () => {
  const [settingsHidden, setSettingsHidden] = useState({
    value1: true,
    value2: true,
    value3: true,
    value4: true,
  })

  return <ScrollableLayout>
    <section className="container my-5">

      {/* Breadboard */}
      <div className="w-full text-body h-20 flex gap-5 p-5 text-white">
          <span className="text-gray-500">{"/"}</span>
          <a className="text-gray-500 underline hover:text-primary" href="/">Home</a>
          <span>{"/"}</span>
          <span className="text-bold">User Settings</span>
      </div>

      {/* User Card Pages */}
      <div className="flex h-64 p-3 justify-evenly items-center gap-5 overflow-x-scroll">

        {/* Name Card */}
        <div className="flex min-w-[350px] max-w-[80vw] h-full p-2 border-primary border backdrop-blur rounded-xl transition-all gap-1 justify-start items-center hover:shadow hover:shadow-primary text-white overflow-clip">
          <div className="bg-green-500 aspect-square max-w-[100px] w-[30%] rounded-full" />
          <div className="flex flex-col p-2 w-full">

            {/* User's Name*/}
            <div className="w-full flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-s"> Name:</p>
                <p className="text-subtitle m-0">Elijah Ahmad</p>
              </div>
              <p>Edit</p>
            </div>

            {/* Bio */}
            <div className="w-full flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-s">Bio:</p>
                <p className=" m-0">I'm a 23 year old software engineer focusin on developing affordable software for everyone</p>
              </div>
              <p>Edit</p>
            </div>

          </div>
        </div>

        {/* Buy Pro Membership */}
        <div className="flex flex-col min-w-[350px]  max-w-[400px] h-full py-2 border-cyan-500 border backdrop-blur rounded-xl transition-all gap-1 justify-center items-center hover:shadow hover:shadow-primary text-white overflow-clip bg-gradient-to-bl from-green-950 to-cyan-950 ">
          <h1 className="text-title px-2 m-1">Buy Premium</h1>
          <p className="px-2 m-1">Get access to premium membership and see features before they are officially released</p>

          <span className="underline">
            from
            {" "}
            <span className="text-subtitle m-0 inline">$6.99</span>
            {" "}
            a month
          </span>
        </div>

        {/* Buy Credits */}
        <div className="flex flex-col min-w-[350px]  max-w-[400px] h-full py-2 border-pink-500 border backdrop-blur rounded-xl transition-all gap-1 justify-center items-center hover:shadow hover:shadow-primary text-white overflow-clip bg-gradient-to-bl from-pink-500/30 to-orange-500/20 ">
          <h1 className="text-title px-2 m-1">Buy Credits</h1>
          <p className="px-2 m-1">You currently have <span className="font-bold ">300 Tokens</span>, which gives you 10 minutes of clip generation.</p>

          <span className="underline">
            <span className="text-subtitle m-0 inline">150</span>
            {" "}
            tokens for
            {" "}
            <span className="text-subtitle m-0 inline">$6.99</span>
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-col w-full">

        {/* Open AI Linking */}
        <h2 id="accordion-flush-heading-2">
          <button
            type="button"
            className="flex items-center justify-between w-full py-5 font-medium text-left rtl:text-right text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 "
            data-accordion-target="#accordion-flush-body-2"
            aria-expanded="false"
            aria-controls="accordion-flush-body-2"
            onClick={() => {
              setSettingsHidden(prevState => {
                return {
                  ...prevState,
                  value1: !prevState.value1,
                }
              })
            }}
          >
            <span>
              <span
                className="inline-flex items-center justify-center w-6 h-6 me-2 text-sm font-semibold text-blue-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                  />
                </svg>
                <span className="sr-only">Pending</span>
              </span>
                Add Open AI Access Token
              </span>
            {settingsHidden.value1 && (
              <svg className="w-3 h-3 rotate-180 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" d="M9 5 5 1 1 5" />
              </svg>
            )}
          </button>
        </h2>
        <div hidden={settingsHidden.value1} id="accordion-flush-body-3" aria-labelledby="accordion-flush-heading-3">
          <div className="py-5 border-b border-gray-200 dark:border-gray-700">
            <span className="mb-2 text-gray-500 dark:text-gray-400">
              You are required to dress presentably when dealing with our students.
              However, there is no explicit dress code as such you are required
              to provide your own uniform.
            </span>
            <br />
            <button
              type="button"
              disabled={false}
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:dark:bg-green-400 disabled:bg-green-600"
              onClick={() => { }}
            >
              Agree
            </button>
          </div>
        </div>

        {/* Link to TikTok Account */}
        <h2 id="accordion-flush-heading-2">
          <button
            type="button"
            className="flex items-center justify-between w-full py-5 font-medium text-left rtl:text-right text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 "
            data-accordion-target="#accordion-flush-body-2"
            aria-expanded="false"
            aria-controls="accordion-flush-body-2"
            onClick={() => {
              setSettingsHidden(prevState => {
                return {
                  ...prevState,
                  value2: !prevState.value2,
                }
              })
            }}
          >
            <span>
              <span
                className="inline-flex items-center justify-center w-6 h-6 me-2 text-sm font-semibold text-blue-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                  />
                </svg>
                <span className="sr-only">Pending</span>
              </span>
                TikTok Integration
              </span>
            {settingsHidden.value2 && (
              <svg className="w-3 h-3 rotate-180 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" d="M9 5 5 1 1 5" />
              </svg>
            )}
          </button>
        </h2>
        <div hidden={settingsHidden.value2} id="accordion-flush-body-3" aria-labelledby="accordion-flush-heading-3">
          <div className="py-5 border-b border-gray-200 dark:border-gray-700">
            <span className="mb-2 text-gray-500 dark:text-gray-400">
              Link your tiktok account to post directly to tiktok
            </span>
            <br />
            <button
              type="button"
              disabled={false}
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:dark:bg-green-400 disabled:bg-green-600"
              onClick={() => { }}
            >
              Agree
            </button>
          </div>
        </div>

        {/* Feedback */}
        <h2 id="accordion-flush-heading-2">
          <button
            type="button"
            className="flex items-center justify-between w-full py-5 font-medium text-left rtl:text-right text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 "
            data-accordion-target="#accordion-flush-body-2"
            aria-expanded="false"
            aria-controls="accordion-flush-body-2"
            onClick={() => {
              setSettingsHidden(prevState => {
                return {
                  ...prevState,
                  value3: !prevState.value3,
                }
              })
            }}
          >
            <span>
              <span
                className="inline-flex items-center justify-center w-6 h-6 me-2 text-sm font-semibold text-blue-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                  />
                </svg>
                <span className="sr-only">Pending</span>
              </span>
                Request Features
              </span>
            {settingsHidden.value3 && (
              <svg className="w-3 h-3 rotate-180 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" d="M9 5 5 1 1 5" />
              </svg>
            )}
          </button>
        </h2>
        <div hidden={settingsHidden.value3} id="accordion-flush-body-3" aria-labelledby="accordion-flush-heading-3">
          <div className="py-5 border-b border-gray-200 dark:border-gray-700">
            <span className="mb-2 text-gray-500 dark:text-gray-400">
              Link your tiktok account to post directly to tiktok
            </span>
            <br />
            <button
              type="button"
              disabled={false}
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:dark:bg-green-400 disabled:bg-green-600"
              onClick={() => { }}
            >
              Agree
            </button>
          </div>
        </div>

        {/* Feedback */}
        <h2 id="accordion-flush-heading-2">
          <button
            type="button"
            className="flex items-center justify-between w-full py-5 font-medium text-left rtl:text-right text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 "
            data-accordion-target="#accordion-flush-body-2"
            aria-expanded="false"
            aria-controls="accordion-flush-body-2"
            onClick={() => {
              setSettingsHidden(prevState => {
                return {
                  ...prevState,
                  value4: !prevState.value4,
                }
              })
            }}
          >
            <span>
              <span
                className="inline-flex items-center justify-center w-6 h-6 me-2 text-sm font-semibold text-blue-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-400"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                  />
                </svg>
                <span className="sr-only">Pending</span>
              </span>
                Request Features
              </span>
            {settingsHidden.value4 && (
              <svg className="w-3 h-3 rotate-180 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" d="M9 5 5 1 1 5" />
              </svg>
            )}
          </button>
        </h2>
        <div hidden={settingsHidden.value4} id="accordion-flush-body-3" aria-labelledby="accordion-flush-heading-3">
          <div className="py-5 border-b border-gray-200 dark:border-gray-700">
            <span className="mb-2 text-gray-500 dark:text-gray-400">
              Link your tiktok account to post directly to tiktok
            </span>
            <br />
            <button
              type="button"
              disabled={false}
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:dark:bg-green-400 disabled:bg-green-600"
              onClick={() => { }}
            >
              Agree
            </button>
          </div>
        </div>


        <div className="flex flex-col gap-2 p-5 w-full justify-center items-center">
          <p className="text-white text-subtitle">Extra Options</p>
          <div>
          <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Contact Support</button>
            <button type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Request API Access</button>
            <button type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Delete Account</button>
          </div>
        </div>
      </div>



    </section>
  </ScrollableLayout>
}