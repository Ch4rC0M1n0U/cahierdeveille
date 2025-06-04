import type React from "react"
import { useRef } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"

interface SignaturePadProps {
  onSave: (signature: string) => void
  width?: number
  height?: number
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, width = 300, height = 150 }) => {
  const sigCanvas = useRef<SignatureCanvas>(null)

  const clear = () => {
    sigCanvas.current?.clear()
  }

  const save = () => {
    if (sigCanvas.current) {
      const trimmedCanvas = sigCanvas.current.getTrimmedCanvas()
      const imageData = trimmedCanvas.toDataURL("image/png")
      onSave(imageData)
    }
  }

  return (
    <div>
      <SignatureCanvas
        ref={sigCanvas}
        canvasProps={{
          width: width,
          height: height,
          className: "border border-gray-300 rounded",
        }}
      />
      <div className="mt-2 space-x-2">
        <Button onClick={clear} variant="outline">
          Effacer
        </Button>
        <Button onClick={save}>Enregistrer</Button>
      </div>
    </div>
  )
}

export default SignaturePad
