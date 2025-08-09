import { useState, useCallback } from 'react'
import { z } from 'zod'

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>
  initialValues: T
  onSubmit: (values: T) => Promise<void> | void
}

interface FormFieldError {
  field: keyof T
  message: string
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit
}: UseFormValidationProps<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormFieldError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when value changes
    setErrors(prev => prev.filter(error => error.field !== field))
  }, [])

  const setError = useCallback((field: keyof T, message: string) => {
    setErrors(prev => {
      const filtered = prev.filter(error => error.field !== field)
      return [...filtered, { field, message }]
    })
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const getFieldError = useCallback((field: keyof T) => {
    return errors.find(error => error.field === field)?.message
  }, [errors])

  const hasFieldError = useCallback((field: keyof T) => {
    return errors.some(error => error.field === field)
  }, [errors])

  const validateField = useCallback((field: keyof T, value: any) => {
    try {
      // Create a partial schema for just this field
      const fieldSchema = z.object({ [field]: schema.shape[field] })
      fieldSchema.parse({ [field]: value })
      
      // Clear error if validation passes
      setErrors(prev => prev.filter(error => error.field !== field))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0]?.message
        if (fieldError) {
          setError(field, fieldError)
        }
      }
      return false
    }
  }, [schema, setError])

  const validateForm = useCallback(() => {
    try {
      schema.parse(values)
      setErrors([])
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(err => ({
          field: err.path[0] as keyof T,
          message: err.message
        }))
        setErrors(fieldErrors)
      }
      return false
    }
  }, [schema, values])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateForm, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors([])
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setError,
    clearErrors,
    getFieldError,
    hasFieldError,
    validateField,
    validateForm,
    handleSubmit,
    reset
  }
}