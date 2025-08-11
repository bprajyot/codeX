import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { LANGUAGE_VERSIONS } from './constants';

const languages = Object.entries(LANGUAGE_VERSIONS);

function LanguageSelector({ language, onSelect }) {
    return (
        <div>
            <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="cursor-pointer inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 hover:bg-gray-900 hover:text-white">
                    {language}
                    <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
                </MenuButton>

                <MenuItems
                    transition
                    className="cursor-pointer absolute left-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-gray-700 shadow-lg  
                    transition data-[state=closed]:scale-95 data-[state=closed]:opacity-0
                    data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
                >
                    <div className="py-1">
                        {languages.map(([langName, version]) => (
                            <MenuItem
                                key={langName}
                                onClick={() => onSelect(langName)}
                            >
                                {({ active }) => (
                                    <span
                                        className={`block pl-5 py-2 text-sm ${langName === language
                                                ? 'text-teal-500 text-lg font-bold'
                                                : active
                                                    ? 'bg-gray-800 text-white font-semibold text-lg'
                                                    : 'text-white'
                                            }`}
                                    >
                                        {langName}
                                    </span>
                                )}
                            </MenuItem>
                        ))}
                    </div>
                </MenuItems>
            </Menu>
        </div>
    );
}

export default LanguageSelector;
