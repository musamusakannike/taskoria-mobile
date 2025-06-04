import React from "react"
import { Text, TouchableOpacity, GestureResponderEvent } from "react-native"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "flex flex-row items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground",
                destructive: "bg-red-600 text-white",
                outline: "border border-gray-300 bg-white text-black",
                secondary: "bg-secondary text-secondary-foreground",
                ghost: "bg-transparent text-black",
                link: "text-blue-600 underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-11 px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
    onPress?: (event: GestureResponderEvent) => void
    disabled?: boolean
    children: React.ReactNode
    className?: string
    textClassName?: string
}

const Button = ({
    variant,
    size,
    disabled,
    onPress,
    children,
    className,
    textClassName = "",
}: ButtonProps) => {
    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            className={cn(buttonVariants({ variant, size }), className)}
        >
            <Text className={`text-center ${textClassName}`}>{children}</Text>
        </TouchableOpacity>
    )
}

export { Button, buttonVariants }
