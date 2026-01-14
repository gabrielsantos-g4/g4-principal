"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createInstance } from "@/actions/messenger/instances-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const formSchema = z.object({
    name: z
        .string()
        .min(2, "O nome deve ter pelo menos 2 caracteres")
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "O nome não pode conter espaços ou caracteres especiais (apenas letras, números, - e _)"
        ),
})

interface CreateInstanceDialogProps {
    children: React.ReactNode
}

export function CreateInstanceDialog({ children }: CreateInstanceDialogProps) {
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        setError(null)
        startTransition(async () => {
            const result = await createInstance(values.name)

            if (result.error) {
                setError(result.error)
            } else {
                setOpen(false)
                form.reset()
                router.refresh()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Nova Instância</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Crie uma nova conexão com o WhatsApp. O nome deve ser único.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Instância</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ex: marketing-01"
                                            {...field}
                                            disabled={isPending}
                                            className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                                            onChange={(e) => {
                                                const value = e.target.value
                                                // Only allow valid characters
                                                if (/^[a-zA-Z0-9_-]*$/.test(value)) {
                                                    field.onChange(value)
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                className="bg-transparent border-white/20 text-white hover:bg-white/10"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Criando..." : "Criar Instância"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
