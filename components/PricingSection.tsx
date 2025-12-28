"use client"

import * as React from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LUCETA_PRODUCTS, AudioProduct } from "@/lib/dodo-payments"

type PlanLevel = "starter" | "pro" | "enterprise"

interface PricingFeature {
  name: string
  included: PlanLevel | "all"
}

interface PricingPlan {
  name: string
  level: PlanLevel
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
  product_id: string
}

const features: PricingFeature[] = [
  { name: "Audio cursor integration", included: "starter" },
  { name: "Up to 50 audio experiences/month", included: "starter" },
  { name: "Basic game engine support", included: "starter" },
  { name: "Community support", included: "starter" },
  { name: "Advanced gesture recognition", included: "pro" },
  { name: "Up to 1,000 audio experiences/month", included: "pro" },
  { name: "Multi-platform deployment", included: "pro" },
  { name: "Priority support", included: "pro" },
  { name: "Custom audio templates", included: "enterprise" },
  { name: "Unlimited audio experiences", included: "enterprise" },
  { name: "Dedicated audio engineering support", included: "enterprise" },
  { name: "24/7 technical assistance", included: "enterprise" },
  { name: "One-click global deployment", included: "all" },
  { name: "Game engine integration", included: "all" },
]

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: { monthly: 29, yearly: 290 },
    level: "starter",
    product_id: "pdt_0NV1JDzkDFrj9uiSzxHrl", // Subscription product
  },
  {
    name: "Pro",
    price: { monthly: 99, yearly: 990 },
    level: "pro",
    popular: true,
    product_id: "pdt_0NV1JE2C5LsZ3WDz9uY2L", // Subscription product
  },
  {
    name: "Enterprise",
    price: { monthly: 299, yearly: 2990 },
    level: "enterprise",
    product_id: "pdt_0NV1JE4U7U5uzVjPa0DzK", // Subscription product
  },
]

function shouldShowCheck(included: PricingFeature["included"], level: PlanLevel): boolean {
  if (included === "all") return true
  if (included === "enterprise" && level === "enterprise") return true
  if (included === "pro" && (level === "pro" || level === "enterprise")) return true
  if (included === "starter") return true
  return false
}

export function PricingSection() {
  const [isYearly, setIsYearly] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>("pro")
  const [isLoading, setIsLoading] = React.useState<string | null>(null)

  const handlePlanPurchase = async (plan: PricingPlan) => {
    if (isLoading) return // Prevent double-click
    
    setIsLoading(plan.product_id)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: plan.product_id,
          customer: {
            email: 'customer@luceta.audio',
            name: 'Luceta Customer',
          },
          plan_type: isYearly ? 'yearly' : 'monthly',
          quantity: 1,
        }),
      })

      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        console.error('Invalid JSON response:', text)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (!data.checkout_url) {
        console.error('Response missing checkout_url:', data)
        throw new Error('No checkout URL received')
      }
      
      // Redirect to Dodo Payments checkout
      window.location.assign(data.checkout_url)
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-figtree text-[40px] font-normal leading-tight mb-4"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-figtree text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Get started with Luceta audio platform. All plans include one-click global deployment and game engine integration.
          </motion.p>
        </div>

        {/* Billing Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-secondary rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-2 rounded-full font-figtree text-lg transition-all",
                !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2 rounded-full font-figtree text-lg transition-all",
                isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Yearly
              <span className="ml-2 text-sm text-[#156d95]">Save 17%</span>
            </button>
          </div>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className={cn(
                "relative p-8 rounded-2xl text-left transition-all border-2 cursor-pointer",
                selectedPlan === plan.level
                  ? "border-[#156d95] bg-[#156d95]/5"
                  : "border-border hover:border-[#156d95]/50",
              )}
              onClick={() => setSelectedPlan(plan.level)}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#156d95] text-white px-4 py-1 rounded-full text-sm font-figtree">
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="font-figtree text-2xl font-medium mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-figtree text-4xl font-medium">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="font-figtree text-lg text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlanPurchase(plan)
                }}
                disabled={isLoading === plan.product_id}
                className={cn(
                  "w-full py-3 px-6 rounded-full font-figtree text-lg transition-all text-center relative",
                  selectedPlan === plan.level 
                    ? "bg-[#156d95] text-white hover:bg-[#156d95]/90" 
                    : "bg-secondary text-foreground hover:bg-[#156d95] hover:text-white",
                  isLoading === plan.product_id && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading === plan.product_id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  selectedPlan === plan.level ? "Get Started" : "Select Plan"
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Features Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="border border-border rounded-2xl overflow-hidden bg-card"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[768px]">
              {/* Table Header */}
              <div className="flex items-center p-6 bg-secondary border-b border-border">
                <div className="flex-1">
                  <h3 className="font-figtree text-xl font-medium">Features</h3>
                </div>
                <div className="flex items-center gap-8">
                  {plans.map((plan) => (
                    <div key={plan.level} className="w-24 text-center font-figtree text-lg font-medium">
                      {plan.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Rows */}
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className={cn(
                    "flex items-center p-6 transition-colors",
                    index % 2 === 0 ? "bg-background" : "bg-secondary/30",
                    feature.included === selectedPlan && "bg-[#156d95]/5",
                  )}
                >
                  <div className="flex-1">
                    <span className="font-figtree text-lg">{feature.name}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    {plans.map((plan) => (
                      <div key={plan.level} className="w-24 flex justify-center">
                        {shouldShowCheck(feature.included, plan.level) ? (
                          <div className="w-6 h-6 rounded-full bg-[#156d95] flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by 1000+ game developers worldwide
          </p>
          <div className="flex justify-center items-center gap-8 text-xs text-muted-foreground">
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Secure payments by Dodo Payments</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
