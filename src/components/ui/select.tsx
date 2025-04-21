import * as React from "react"
import {
  Select as RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select"

import { cn } from "@/lib/utils"

const Select = React.forwardRef<
  React.ElementRef<typeof RadixSelect>,
  React.ComponentPropsWithoutRef<typeof RadixSelect>
>(({ children, ...props }, ref) => (
  <RadixSelect ref={ref} {...props}>
    {children}
  </RadixSelect>
))
Select.displayName = "Select"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
