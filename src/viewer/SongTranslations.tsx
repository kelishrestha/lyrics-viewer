import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { getLangNameFromCode } from 'language-name-map'
import { ChevronDown, Translate } from "react-bootstrap-icons";

import type { TranslationSongs } from './types';

const translationLabel = (lang: string) => {
  if(!lang) return null

  return getLangNameFromCode(lang)?.name || lang
}

export function SongTranslations({ translations }: { translations: TranslationSongs[] }) {
  if (!translations.length) return null

  return (
    <Menu as="div" className="relative inline-block w-fit">
      <MenuButton className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm/6
                   font-semibold text-gray-900 shadow-inner shadow-white/10
                   focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white
                   data-hover:bg-primary/80 data-open:bg-primary/90">
        <Translate size={20} />
        Translations
        <ChevronDown aria-hidden="true" className="-mr-1 size-5 text-gray-900" />
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
            translations.map((translation) => (
              <MenuItem key={translation.language}>
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
