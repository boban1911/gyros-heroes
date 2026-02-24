import React from 'react';
import { MenuItem as MenuItemType } from '../data/menu';
import { MenuItemMobile } from './menu/MenuItemMobile';
import { MenuItemDesktop } from './menu/MenuItemDesktop';

interface MenuItemProps {
    item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
    return (
        <div className="relative w-full md:w-[287px] md:mt-[83px] group mx-auto shrink-0">
            {/* Mobile Layout (Visible only on small screens) */}
            <div className="md:hidden">
                <MenuItemMobile item={item} />
            </div>

            {/* Desktop Layout (Visible on md and larger) */}
            <div className="hidden md:block">
                <MenuItemDesktop item={item} />
            </div>
        </div>
    );
};

export default MenuItem;
