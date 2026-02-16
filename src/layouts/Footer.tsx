import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { Github, GlobeCentralSouthAsia, HeartFill } from 'react-bootstrap-icons'

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false)

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
        className="rounded-md bg-black/10 dark:bg-black/30 px-4 py-2 text-sm font-medium text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-black/30 cursor-pointer"
      >
        {/* Logo */}
        <img src="/logo.png" alt="logo" className="h-fit w-fit"/>
      </Button>

      <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close} __demoMode>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="flex gap-2 items-center text-base/7 font-medium text-primary-background-alternate">
                Created with <HeartFill className='text-red-700' size={20} /> by Kelina
              </DialogTitle>
              <div className='grid grid-cols-3 grid-flow-col-dense gap-2'>
                <p className="col-span-2 flex flex-col mt-2 text-sm/6 text-primary-background-alternate">
                  You can find me on
                  <a href="https://github.com/kelishrestha" className='flex ml-2 mt-2 hover:underline hover:text-primary'>
                    <Github size={20} className="mr-2" />
                    as kelishrestha
                  </a>
                  <a href="https://kelinashrestha.com.np" className='flex ml-2 hover:underline hover:text-primary'>
                    <GlobeCentralSouthAsia size={20} className="mr-2" />
                    My website
                  </a>
                </p>
                <img src="/favicon.png" className='w-20 mt-2 align-baseline justify-self-end' />
              </div>
              <p className="flex flex-col mt-4 text-xs text-primary-background-alternate">
                <i>
                  Note:
                  <br/>
                  No content saved while building this app.
                  100% accuracy not guaranteed while fetching lyrics.
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
