"use client";
import Editor from "@/components/Editor";
import MDX from "@/components/MDX";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Notes() {
  const [isViewer, setIsViewer] = useState(true);
  // const [text, setText] = useState("");
  const [note, setNote] = useState({
    content: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [noteIds, setNoteIds] = useState([]);
  const [savingNote, setSavingNote] = useState(false);

  const [showNav, setShowNav] = useState(false);
  const { currentUser, isLoadingUser } = useAuth();

  const searchParams = useSearchParams();

  function handleToggleViewer() {
    // isViewer = !isViewer
    setIsViewer(!isViewer);
  }

  function handleToggleMenu() {
    setShowNav(!showNav);
  }

  function handleCreateNote() {
    //create a new note
    setNote({
      content: "",
    });
    setIsViewer(false);
    window.history.replaceState(null, "", "/notes");
  }

  function handleEditNote(e) {
    // edit an existing note
    setNote({ ...note, content: e.target.value });
  }

  async function handleSaveNote() {
    // to save a note
    if (!note?.content) {
      return;
    }
    setSavingNote(true);
    try {
      // see if note already exists in database
      if (note.id) {
        // if its true then we have an existing note cause we have its id, so write to it
        const noteRef = doc(db, "users", currentUser.uid, "notes", note.id);
        await setDoc(
          noteRef,
          {
            ...note,
          },
          { merge: true }
        );
      } else {
        // that means that its a brand new note and will only contain the content field,
        // so we can basically save a new note to firebase
        const newId =
          note.content.replaceAll("#", "").slice(0, 15) + "__" + Date.now();
        const notesRef = doc(db, "users", currentUser.uid, "notes", newId);
        const newDocInfo = await setDoc(notesRef, {
          content: note.content,
          createdAt: serverTimestamp(),
        });
        setNoteIds((curr) => [...curr, newId]);
        setNote({ ...note, id: newId });
        window.history.pushState(null, "", `?id=${newId}`);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setSavingNote(false);
    }
  }

  useEffect(() => {
    // locally cache notes in a global context
    const value = searchParams.get("id");
    if (!value || !currentUser) {
      return;
    }
    async function fetchNotes() {
      if (isLoading) {
        return;
      }
      try {
        setIsLoading(true);
        const noteRef = doc(db, "users", currentUser.uid, "notes", value);
        const snapshot = await getDoc(noteRef);
        const docData = snapshot.exists()
          ? { id: snapshot.id, ...snapshot.data() }
          : null;
        if (docData) {
          setNote(docData);
          setText(docData.content);
          setIsViewer(true);
        }
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotes();
  }, [currentUser, searchParams.get("id")]);

  if (isLoadingUser) {
    return <h6 className="text-gradient">Loading..</h6>;
  }

  if (!currentUser) {
    // if no user found, then boot them to the home page
    window.location.href = "/";
  }

  return (
    <main id="notes">
      <SideNav
        noteIds={noteIds}
        setNoteIds={setNoteIds}
        showNav={showNav}
        setShowNav={setShowNav}
        handleCreateNote={handleCreateNote}
        setIsViewer={setIsViewer}
      />
      {!isViewer && (
        <Editor
          savingNote={savingNote}
          setText={handleEditNote}
          text={note.content}
          isViewer={isViewer}
          handleToggleViewer={handleToggleViewer}
          handleToggleMenu={handleToggleMenu}
          handleSaveNote={handleSaveNote}
        />
      )}
      {isViewer && (
        <MDX
          savingNote={savingNote}
          text={note.content}
          isViewer={isViewer}
          handleToggleViewer={handleToggleViewer}
          handleToggleMenu={handleToggleMenu}
          handleSaveNote={handleSaveNote}
        />
      )}
    </main>
  );
}
