import TopNav from "./TopNav";

export default function Editor(props) {
  const { text, setText } = props;
  return (
    <section className="notes-container">
      <TopNav {...props} />
      <textarea
        value={text}
        onChange={setText}
        placeholder="use # for headings 1 and use ## headings 2
        for eg: # Hi my name..."
      />
    </section>
  );
}
