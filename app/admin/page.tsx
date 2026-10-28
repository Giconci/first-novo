"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);

  // 🔹 Estados para edição
  const [editando, setEditando] = useState<any>(null);
  const [nomeEdit, setNomeEdit] = useState("");
  const [precoEdit, setPrecoEdit] = useState("");
  const [categoriaEdit, setCategoriaEdit] = useState("");
  const [imagemEdit, setImagemEdit] = useState<File | null>(null);
  const [descricaoEdit, setDescricaoEdit] = useState("");
  const [homeEdit, setHomeEdit] = useState(false);           // 🔹 NOVO
  const [produtosEdit, setProdutosEdit] = useState(true);    // 🔹 NOVO

  // 🔹 Estados para criação
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaImagem, setNovaImagem] = useState<File | null>(null);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoHome, setNovoHome] = useState(false);           // 🔹 NOVO
  const [novoProdutos, setNovoProdutos] = useState(false);    // 🔹 NOVO

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProdutos(data));
  }, []);

  const excluirProduto = async (id: number) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProdutos(produtos.filter((p) => p.id !== id));
  };

  const iniciarEdicao = (produto: any) => {
    setEditando(produto);
    setNomeEdit(produto.name);
    setPrecoEdit(String(produto.price));
    setCategoriaEdit(produto.category || "");
    setDescricaoEdit(produto.description || "");            // 🔹 CORRIGIDO
    setHomeEdit(Boolean(produto.showOnHome));               // 🔹 NOVO
    setProdutosEdit(Boolean(produto.showOnProducts));       // 🔹 NOVO
    setImagemEdit(null);
  };

  const salvarEdicao = async () => {
    const formData = new FormData();
    formData.append("name", nomeEdit);
    formData.append("price", precoEdit);
    formData.append("category", categoriaEdit);
    formData.append("description", descricaoEdit);
    formData.append("showOnHome", String(homeEdit));            // 🔹 NOVO
    formData.append("showOnProducts", String(produtosEdit));    // 🔹 NOVO
    if (imagemEdit) formData.append("image", imagemEdit);

    const res = await fetch(`/api/products/${editando.id}`, {
      method: "PUT",
      body: formData,
    });
    const produtoAtualizado = await res.json();

    setProdutos(produtos.map((p) => (p.id === editando.id ? produtoAtualizado : p)));
    setEditando(null);
  };

  const criarProduto = async () => {
    const formData = new FormData();
    formData.append("name", novoNome);
    formData.append("price", novoPreco);
    formData.append("category", novaCategoria);
    formData.append("description", novaDescricao);
    formData.append("showOnHome", String(novoHome));            // 🔹 NOVO
    formData.append("showOnProducts", String(novoProdutos));    // 🔹 NOVO
    if (novaImagem) formData.append("image", novaImagem);

    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });
    const produtoCriado = await res.json();
    setProdutos([...produtos, produtoCriado]);
    setCriando(false);
    setNovoNome("");
    setNovoPreco("");
    setNovaCategoria("");
    setNovaImagem(null);
    setNovaDescricao("");
    setNovoHome(false);        // 🔹 NOVO
    setNovoProdutos(false);     // 🔹 NOVO
  };

  if (status === "loading") return <p>Carregando...</p>;
  if (!session) {
    router.push("/login");
    return null;
  }
  if (session.user.role !== "admin") {
    router.push("/");
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Painel Admin</h1>
      <p>Bem-vindo, {session.user.name}!</p>

      <button
        onClick={() => setCriando(true)}
        className="bg-petroleo text-white hover:bg-petroleo-escuro px-4 py-2 mt-4"
      >
        Novo Produto
      </button>

      <Link href="/admin/pedidos" className="ml-2 border px-4 py-2 mt-4 inline-block">
        Ver pedidos
      </Link>

      <table className="w-full border mt-6">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nome</th>
            <th className="border p-2">Preço</th>
            <th className="border p-2">Categoria</th>
            <th className="border p-2">Imagem</th>
            <th className="border p-2">Home</th>       {/* 🔹 NOVO */}
            <th className="border p-2">Produtos</th>   {/* 🔹 NOVO */}
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">R$ {p.price}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.name} className="h-16 w-16 object-cover" />
                )}
              </td>
              <td className="border p-2 text-center">{p.showOnHome ? "✅" : "—"}</td>
              <td className="border p-2 text-center">{p.showOnProducts ? "✅" : "—"}</td>
              <td className="border p-2">
                <button
                  onClick={() => iniciarEdicao(p)}
                  className="bg-petroleo-claro text-white px-2 py-1 mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluirProduto(p.id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 Modal de edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-3 w-full max-w-md">
            <h2 className="text-xl font-bold">Editar Produto</h2>
            <input
              type="text"
              placeholder="Nome"
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              className="border p-2"
            />
            <input
              type="number"
              placeholder="Preço"
              value={precoEdit}
              onChange={(e) => setPrecoEdit(e.target.value)}
              className="border p-2"
            />
            <select
              value={categoriaEdit}
              onChange={(e) => setCategoriaEdit(e.target.value)}
              className="border p-2"
            >
              <option value="">Selecione a categoria</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.label}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Descrição"
              value={descricaoEdit}
              onChange={(e) => setDescricaoEdit(e.target.value)}
              className="border p-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImagemEdit(file);
              }}
              className="border p-2"
            />

            {/* 🔹 NOVO: onde o produto aparece */}
            <div className="border rounded p-3 flex flex-col gap-2">
              <p className="font-semibold text-sm">Onde exibir este produto:</p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={produtosEdit}
                  onChange={(e) => setProdutosEdit(e.target.checked)}
                />
                Página de Produtos
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={homeEdit}
                  onChange={(e) => setHomeEdit(e.target.checked)}
                />
                Home
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={salvarEdicao} className="bg-green-500 text-white px-4 py-2">
                Salvar
              </button>
              <button onClick={() => setEditando(null)} className="bg-gray-500 text-white px-4 py-2">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal de criação */}
      {criando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-3 w-full max-w-md">
            <h2 className="text-xl font-bold">Adicionar Produto</h2>

            <input
              type="text"
              placeholder="Nome"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="border p-2"
            />
            <input
              type="number"
              placeholder="Preço"
              value={novoPreco}
              onChange={(e) => setNovoPreco(e.target.value)}
              className="border p-2"
            />
            <select
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              className="border p-2"
            >
              <option value="">Selecione a categoria</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.label}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Descrição"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              className="border p-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setNovaImagem(file);
              }}
              className="border p-2"
            />

            {/* 🔹 NOVO: onde o produto aparece */}
            <div className="border rounded p-3 flex flex-col gap-2">
              <p className="font-semibold text-sm">Onde exibir este produto:</p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={novoProdutos}
                  onChange={(e) => setNovoProdutos(e.target.checked)}
                />
                Página de Produtos
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={novoHome}
                  onChange={(e) => setNovoHome(e.target.checked)}
                />
                Home
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={criarProduto} className="bg-green-500 text-white px-4 py-2">
                Salvar
              </button>
              <button onClick={() => setCriando(false)} className="bg-gray-500 text-white px-4 py-2">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}