import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [cards, setCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then(setCards);
  }, []);

  async function handleAddCard(e) {
    e.preventDefault();
    if (!question || !answer) return;
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    const newCard = await res.json();
    setCards([newCard, ...cards]);
    setQuestion("");
    setAnswer("");
  }

  const handleDelete = async (id) => {
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    setCards(cards.filter((c) => c.id !== id));
  };

  const handleUpdate = async (id, updatedCard) => {
    const res = await fetch(`/api/cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCard),
    });
    const data = await res.json();
    setCards(cards.map((c) => (c.id === id ? data : c)));
  };

  return (
    <div className="app-container">
      <form className="add-form" onSubmit={handleAddCard}>
        <input
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <input
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button type="submit">Add Card</button>
      </form>

      <div className="flashcards">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}

function Card({ card, onDelete, onUpdate }) {
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    question: card.question,
    answer: card.answer,
  });

  if (isEditing) {
    return (
      <div className="card editing">
        <input
          value={editData.question}
          onChange={(e) =>
            setEditData({ ...editData, question: e.target.value })
          }
        />
        <input
          value={editData.answer}
          onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
        />
        <div className="card-btns">
          <button
            onClick={() => {
              onUpdate(card.id, editData);
              setIsEditing(false);
            }}
          >
            Save
          </button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card ${isSelected ? "selected" : ""}`}
      onClick={() => setIsSelected(!isSelected)}
    >
      <p>{isSelected ? card.answer : card.question}</p>
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="edit-btn" onClick={() => setIsEditing(true)}>
          ✎
        </button>
        <button className="delete-btn" onClick={() => onDelete(card.id)}>
          ×
        </button>
      </div>
    </div>
  );
}
