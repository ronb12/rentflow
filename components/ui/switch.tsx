"use client";

import * as React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ onCheckedChange, checked, ...props }, ref) => (
  <input 
    type="checkbox" 
    ref={ref} 
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    {...props} 
  />
));
Switch.displayName = "Switch";

export default Switch;
