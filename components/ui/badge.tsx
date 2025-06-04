import React from "react"
import { Text, View, ViewProps } from "react-native"
import { cn } from "@/lib/utils"

export interface BadgeProps extends ViewProps {
    children: React.ReactNode
    variant?: "default" | "secondary" | "destructive" | "outline"
}

export function Badge({
    children,
    variant = "default",
    className,
    ...props
}: BadgeProps) {
    const variantClasses = {
        default: "bg-primary border-transparent text-primary-foreground",
        secondary: "bg-secondary border-transparent text-secondary-foreground",
        destructive: "bg-destructive border-transparent text-destructive-foreground",
        outline: "border border-border text-foreground",
    }

    return (
        <View
            className={cn(
                "flex-row items-center rounded-full px-2.5 py-0.5",
                variantClasses[variant],
                className
            )}
            {...props}
        >
            <Text className="text-xs font-semibold dark:text-white">{children}</Text>
        </View>
    )
}
