import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { LucideIcon } from "lucide-react"
import { useDrawingContext } from "../context/drawing-context"
import { useEffect, useState } from "react"
import { SliderRange, SliderThumb, SliderTrack } from "@radix-ui/react-slider"
import { ColorPicker } from "./color-picker"

export const ContextMenu = ({ Icon }: { Icon: LucideIcon }) => {
  const {strokeWidth,setStrokeWidth } = useDrawingContext();
  const [sliderValue, setSliderValue] = useState([3]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setStrokeWidth(value[0]);
  };

  useEffect(()=>{
  },[sliderValue])

  return (
    <div className="border-none">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Icon className="border-none outline-none" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="h-full w-full flex justify-center items-center">
            Width
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-4 py-2">
            <Slider
              value={[strokeWidth]}
              onValueChange={handleSliderChange}
              min={3}
              max={30}
              step={2}
              aria-label="Stroke Width"
              className="w-full"
            >
              <SliderTrack className="bg-gray-200 relative flex-1 rounded-full">
                <SliderRange className="absolute bg-blue-500 rounded-full h-full" />
              </SliderTrack>
              <SliderThumb className="block w-4 h-4 bg-blue-500 rounded-full" />
            </Slider>
          </div>

          <DropdownMenuLabel className="h-full w-full flex justify-center items-center">
            Color
            <ColorPicker type="color" />
          </DropdownMenuLabel>
          {/* <DropdownMenuLabel className="h-full w-full flex justify-center items-center">
            Background
          <ColorPicker type="bg"/>
          </DropdownMenuLabel> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
