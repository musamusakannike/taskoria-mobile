import { cn } from "@/lib/utils";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import { Pressable } from "react-native";

interface CheckboxProps {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    className?: string
}

export function Checkbox({
    checked,
    onChange,
    disabled = false,
    className,
}: CheckboxProps) {
    return (
        <Pressable
            onPress={() => !disabled && onChange(!checked)}
            className={cn(
                "h-5 w-5 items-center justify-center rounded-sm border border-primary",
                checked ? "bg-primary" : "bg-background",
                disabled ? "opacity-50" : "",
                className
            )}
            disabled={disabled}
        >
            {checked && (
                <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="white"
                />
            )}
        </Pressable>
    )
}
