import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { getLangNameFromCode } from 'language-name-map'
import { ChevronDown } from "react-bootstrap-icons";
import type { SongDetailType } from './types';

const translationLabel = (lang: string) => {
  if(!lang) return null

  return getLangNameFromCode(lang)?.name || lang
}

export function SongTranslations({ song }: { song: SongDetailType }): JSX.Element {
  if (!song.translation_songs) return null

  return (
    <Menu as="div" className="relative inline-block w-full">
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-800 hover:bg-blue-600
        px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5">
        See Translations
        <ChevronDown aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-gray-800
        outline-1 -outline-offset-1 outline-white/10 transition
        data-closed:scale-95 data-closed:transform data-closed:opacity-0
        data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          {
            song.translation_songs.map((translation) => (
              <MenuItem>
                <a
                  href={translation.url}
                  className="block px-4 py-2 text-sm text-gray-300 cursor-pointer
                   data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                  key={translation.language}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  { translationLabel(translation.language) }
                </a>
              </MenuItem>
            ))
          }
        </div>
      </MenuItems>
    </Menu>
  )
}
