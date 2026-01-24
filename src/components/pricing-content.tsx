'use client'

import { useState } from 'react'
import { Check, Info } from "lucide-react"

interface PricingContentProps {
    currency: 'USD' | 'BRL';
}

export function PricingContent({ currency }: PricingContentProps) {
    const t = {
        USD: {
            title: "Plans & Pricing",
            subtitle: "Choose the plan that best fits your needs. Usage resets monthly. No rollover.",
            features: "Features",
            popular: "MOST POPULAR",
            mo: "/mo",
            close: "Close",
            info: "Info",
            included: "Included",
            unlimited: "Unlimited",
            categoryTitles: {
                orchestration: "ORCHESTRATION",
                strategy: "STRATEGY (Unlimited in all plans)",
                marketing: "MARKETING",
                sales: "SALES"
            }
        },
        BRL: {
            title: "Planos e Preços",
            subtitle: "Escolha o plano que melhor atende suas necessidades. O uso reinicia mensalmente. Sem acúmulo.",
            features: "Funcionalidades",
            popular: "MAIS POPULAR",
            mo: "/mês",
            close: "Fechar",
            info: "Info",
            included: "Incluso",
            unlimited: "Ilimitado",
            categoryTitles: {
                orchestration: "ORQUESTRAÇÃO",
                strategy: "ESTRATÉGIA (Ilimitado em todos os planos)",
                marketing: "MARKETING",
                sales: "VENDAS"
            }
        }
    }[currency]

    const plans = {
        USD: [
            { name: "Free", price: "$0", active: false },
            { name: "Basic", price: "$50", active: false },
            { name: "Core", price: "$250", active: false },
            { name: "Pro", price: "$650", active: true },
            { name: "Enterprise", price: "$1500", active: false, subtitle: "(Human Involved)" }
        ],
        BRL: [
            { name: "Free", price: "R$0", active: false },
            { name: "Básico", price: "R$290", active: false },
            { name: "Pleno", price: "R$1490", active: false },
            { name: "Pro", price: "R$3900", active: true },
            { name: "Enterprise", price: "R$8490", active: false, subtitle: "(Humano Envolvido)" }
        ]
    }[currency]

    interface CategoryItem {
        name: string
        values: string[]
        metric?: string
        definition?: string
        color?: string
    }

    interface Category {
        title: string
        subtitle?: string
        items: CategoryItem[]
    }

    const categories: Category[] = [
        {
            title: t.categoryTitles.orchestration,
            items: [
                { name: "User Access", values: [t.included, t.included, t.included, t.included, t.included] },
                { name: "Agatha (Dashboard)", values: [t.included, t.included, t.included, t.included, t.included] }
            ]
        },
        {
            title: t.categoryTitles.strategy,
            items: [
                { name: "Brian – Growth, Brainstorm", values: [t.unlimited, t.unlimited, t.unlimited, t.unlimited, t.unlimited] },
                { name: "Luke – Audience, ICP, Insights", values: [t.unlimited, t.unlimited, t.unlimited, t.unlimited, t.unlimited] },
                { name: "Celine – Competitors, Differentiation", values: [t.unlimited, t.unlimited, t.unlimited, t.unlimited, t.unlimited] },
                { name: "Liz – Channels, Media Plan", values: [t.unlimited, t.unlimited, t.unlimited, t.unlimited, t.unlimited] }
            ]
        },
        {
            title: t.categoryTitles.marketing,
            items: [
                {
                    name: "Lauren – Organic Social",
                    metric: currency === 'USD' ? "Items per month" : "Itens por mês",
                    definition: currency === 'USD' ? "1 item = 1 final output saved/exported" : "1 item = 1 saída final salva/exportada",
                    values: ["5", "10", "40", "120", "300"],
                    color: "text-pink-400"
                },
                {
                    name: "John – Paid Social",
                    metric: currency === 'USD' ? "Reports" : "Relatórios",
                    definition: currency === 'USD' ? "1 report = 1 full processed report with input + output" : "1 relatório = 1 relatório completo processado + saída",
                    values: ["5", "10", "40", "120", "300"],
                    color: "text-blue-400"
                },
                {
                    name: "Joelle – Organic Search (SEO)",
                    metric: currency === 'USD' ? "Articles" : "Artigos",
                    definition: currency === 'USD' ? "1 article = text with 600+ words" : "1 artigo = texto com 600+ palavras",
                    values: ["5", "10", "40", "120", "300"],
                    color: "text-green-400"
                },
                {
                    name: "David – Paid Search",
                    metric: currency === 'USD' ? "Ads" : "Anúncios",
                    definition: currency === 'USD' ? "1 ad = complete variation (headline + body + CTA)" : "1 anúncio = variação completa (título + corpo + CTA)",
                    values: ["5", "10", "40", "120", "300"],
                    color: "text-yellow-400"
                },
                {
                    name: "Melinda – Design & Video",
                    metric: currency === 'USD' ? "Kits" : "Kits",
                    definition: currency === 'USD' ? "1 kit = 1 creative kit OR 1 short edited video (up to 1:30)" : "1 kit = 1 kit criativo OU 1 vídeo curto editado (até 1:30)",
                    values: ["0", "0", "4", "8", "20"],
                    color: "text-purple-400"
                },
                {
                    name: "Noah – Copy & Messaging",
                    metric: currency === 'USD' ? "Items" : "Itens",
                    definition: currency === 'USD' ? "1 item = 1 final revised text" : "1 item = 1 texto final revisado",
                    values: ["1", "2", "6", "12", "30"],
                    color: "text-indigo-400"
                },
                {
                    name: "Jacob – Landing Page",
                    metric: currency === 'USD' ? "Landing pages" : "Landing pages",
                    definition: currency === 'USD' ? "1 landing page = structure + copy + design + setup" : "1 landing page = estrutura + copy + design + configuração",
                    values: ["0", "0", "0", "1", "2"],
                    color: "text-orange-400"
                },
                {
                    name: "Bella – UTM Tracking",
                    metric: currency === 'USD' ? "Items" : "Itens",
                    definition: currency === 'USD' ? "1 item = 1 link/event/tag created and stored" : "1 item = 1 link/evento/tag criado e armazenado",
                    values: ["10", "50", "100", "200", "500"],
                    color: "text-teal-400"
                }
            ]
        },
        {
            title: t.categoryTitles.sales,
            items: [
                {
                    name: "Amanda – Prospect Research",
                    metric: currency === 'USD' ? "Leads" : "Leads",
                    definition: currency === 'USD' ? "1 lead = validated company + identified contact" : "1 lead = empresa validada + contato identificado",
                    values: ["0", "40", "150", "400", "1000"],
                    color: "text-red-400"
                },
                {
                    name: "Paul – Cold Messaging",
                    metric: currency === 'USD' ? "Cycles" : "Ciclos",
                    definition: currency === 'USD' ? "1 cycle = 1 complete follow-up cadence of 5 messages sent to the same lead" : "1 ciclo = 1 cadência completa de 5 mensagens enviadas para o mesmo lead",
                    values: ["100", "500", "1000", "3000", "5000"],
                    color: "text-cyan-400"
                },
                {
                    name: "Jess – Lead Qualification",
                    metric: currency === 'USD' ? "Cycles" : "Ciclos",
                    definition: currency === 'USD' ? "1 cycle = 1 conversation started + up to 5 follow-up messages" : "1 ciclo = 1 conversa iniciada + até 5 mensagens de acompanhamento",
                    values: ["10", "50", "500", "1000", "2000"],
                    color: "text-rose-400"
                },
                {
                    name: "Emily – Pipeline & CRM",
                    metric: currency === 'USD' ? "Items" : "Itens",
                    definition: currency === 'USD' ? "1 item = 1 active lead in the pipeline" : "1 item = 1 lead ativo no pipeline",
                    values: ["20", "200", "500", "1000", "2000"],
                    color: "text-emerald-400"
                }
            ]
        }
    ]

    return (
        <div className="w-full">

            {/* Plans Header */}
            <div className="grid grid-cols-6 gap-4 border-b border-white/10 pb-4">
                <div className="col-span-1 flex items-end">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.features}</span>
                </div>
                {plans.map((plan) => (
                    <div key={plan.name} className={`col-span-1 text-center ${plan.active ? 'relative' : ''}`}>
                        {plan.active && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1C73E8] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                {t.popular}
                            </div>
                        )}
                        <div className={`text-sm font-bold mb-1 ${plan.active ? 'text-white' : 'text-gray-200'}`}>
                            {plan.name}
                        </div>
                        {plan.subtitle && (
                            <div className="text-[9px] text-[#1C73E8] font-bold uppercase tracking-wider mb-1">
                                {plan.subtitle}
                            </div>
                        )}
                        <div className="text-xl font-bold text-white">{plan.price}<span className="text-sm text-gray-400 font-normal">{t.mo}</span></div>
                    </div>
                ))}
            </div>

            <div className="space-y-12 mt-6">
                {categories.map((category, catIndex) => (
                    <div key={catIndex}>
                        <div className="mb-4 pb-2 border-b border-white/10">
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">{category.title}</h4>
                            {category.subtitle && <p className="text-xs text-gray-500 mt-1">{category.subtitle}</p>}
                        </div>

                        <div className="space-y-1">
                            {category.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="grid grid-cols-6 gap-4 py-3 hover:bg-white/5 rounded-lg transition-colors items-center group">
                                    <div className="col-span-1 px-2">
                                        <div className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                                            {item.name}
                                        </div>
                                        {item.definition && (
                                            <div className="relative inline-block mt-1 group/tooltip cursor-help">
                                                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                                    <Info size={10} />
                                                    <span>{t.info}</span>
                                                </div>
                                                <div className="absolute left-0 bottom-full mb-2 w-48 bg-black border border-white/10 p-2 rounded text-[10px] text-gray-300 shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 pointer-events-none">
                                                    {item.definition}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {item.values.map((value, valIndex) => (
                                        <div key={valIndex} className={`col-span-1 text-center text-sm ${plans[valIndex].active ? 'font-bold text-white' : 'text-gray-400'}`}>
                                            {value === t.included ? (
                                                <Check size={16} className="mx-auto text-green-500" />
                                            ) : value === "Included" ? (
                                                <Check size={16} className="mx-auto text-green-500" />
                                            ) : value === t.unlimited ? (
                                                <span className="text-green-400 font-bold">∞</span>
                                            ) : value === "Unlimited" ? (
                                                <span className="text-green-400 font-bold">∞</span>
                                            ) : (
                                                <span>
                                                    {value}
                                                    {item.metric && <span className="text-[10px] text-gray-500 ml-1 font-normal">{item.metric}</span>}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
