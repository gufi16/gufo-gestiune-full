type Props = {
  children: React.ReactNode
}

export default function TableCell({ children }: Props) {

  return (
    <td className="px-3 py-2 text-[13px]">

      {children}

    </td>
  )
}
