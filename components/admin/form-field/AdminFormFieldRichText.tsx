"use client"
import { Editor } from '@tinymce/tinymce-react'
import { Editor as TinyMCEEditor } from 'tinymce';
import React, { useRef, useState } from 'react'

type State = {
  name?: string,
  label?: string | null,
  required?: boolean,
  className?: string,
  placeholder?: string,
  defaultValue?: any,
  value?: string,
  onChange?: (data: string) => void,
}

const AdminFormFieldRichText: React.FC<State> = ({
  name,
  label,
  required = false,
  className = '',
  placeholder,
  value,
  defaultValue,
  onChange
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null)
  
  const [editorContent, setEditorContent] = useState(value);

  const handleEditorChange = (content: string, editor: TinyMCEEditor) => {
    setEditorContent(content)

    if (typeof onChange == "function") {
      onChange(content)
    }
  }

  return (
    <div className={className}>
      { label
        ? <p className="text-sm font-medium mb-1 capitalize">{label} { required && <span className="text-red-500">*</span> }</p>
        : null
      }
      <div className={`rounded bg-gray-200 focus-within:bg-gray-300 select-none ${className}`}>
        <input type="hidden" name={name} value={editorContent || ''} />
        <style>{`
          .tox-tinymce { border-radius: 5px }
          .tox-statusbar__branding {
            display: none
          }
          .tox-editor-header {
            padding: 4px 2px !important;
          }
          .tox-toolbar__group {
            padding: 0px 2px !important;
          }
          .tox-toolbar__group > * {
            margin: 0 !important;
          }
          .tox-toolbar__primary > * + * {
            border-left: 1px solid #ccc !important;
          }
        `}</style>
        <Editor
          onInit={(evt, editor) => {editorRef.current = editor}}
          tinymceScriptSrc={'/js/tinymce/tinymce.min.js'}
          onEditorChange={handleEditorChange}
          initialValue={defaultValue}
          value={value}
          tagName={name}
          init={{
            height: 300,
            min_height: 300,
            menubar: false,
            "plugins": [
              "advlist","autolink", "autoresize",
              "lists","link","image","charmap","preview","anchor","searchreplace","visualblocks",
              "fullscreen","insertdatetime","media","table","help","wordcount", "code", "codesample"
            ],
            toolbar: "styles | alignleft aligncenter alignright | bold italic forecolor backcolor | bullist numlist | link image table codesample | code fullscreen ",
            content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:14px }`,
            images_upload_url: '/api/admin/images/upload-tinymce'
          }}
        />
      </div>
    </div>
  )
}

export default AdminFormFieldRichText