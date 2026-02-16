import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { Github, GlobeCentralSouthAsia, HeartFill } from 'react-bootstrap-icons'

export default function Footer() {
  let [isOpen, setIsOpen] = useState(true)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={open}
        className="rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-black/30"
      >
        {/* Logo */}
        <img src="/logo.png" alt="logo" className="h-14 w-fit"/>
      </Button>

      <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close} __demoMode>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="flex gap-2 items-center text-base/7 font-medium text-white">
                Created with <HeartFill className='text-red-700' size={20} /> by Kelina
              </DialogTitle>
              <p className="flex flex-col mt-2 text-sm/6 text-white/50">
                You can find me on
                <a href="https://github.com/kelishrestha" className='flex ml-2 mt-2 hover:underline hover:text-amber-400'>
                  <Github size={20} className="mr-2" />
                  as kelishrestha
                </a>
                <a href="https://kelinashrestha.com.np" className='flex ml-2 hover:underline hover:text-amber-400'>
                  <GlobeCentralSouthAsia size={20} className="mr-2" />
                  My website
                </a>
              </p>
              <p className="flex flex-col mt-2 text-sm/6 text-white/50">
                <i>
                  Note: No content saved while building this app.
                </i>
              </p>
              <div className="mt-4">
                <Button
                  className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-purple-600 data-open:bg-purple-700"
                  onClick={close}
                >
                  Got it, thanks!
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}
